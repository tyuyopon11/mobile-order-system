import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

function getCellText(sheet: XLSX.WorkSheet, cell: string) {
  const value = sheet[cell]?.v;

  return value === undefined || value === null
    ? ""
    : String(value).trim();
}

function getCellNumber(sheet: XLSX.WorkSheet, cell: string) {
  const value = sheet[cell]?.v;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/¥/g, "")
    .trim();

  const number = Number(cleaned);

  return Number.isNaN(number) ? null : number;
}

function excelDateToDateString(value: unknown) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (!parsed) {
      return null;
    }

    const year = String(parsed.y);
    const month = String(parsed.m).padStart(2, "0");
    const day = String(parsed.d).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const text = String(value).trim();

  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(text)) {
    const [year, month, day] = text.split("/");

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(text)) {
    const [year, month, day] = text.split("-");

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Excelファイルが選択されていません。" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, {
      type: "array",
      cellDates: true,
    });

    const settingSheet = workbook.Sheets["展示会設定"];
    const itemSheet = workbook.Sheets["商品リスト"];

    if (!settingSheet) {
      return NextResponse.json(
        {
          error: `展示会設定シートが見つかりません。検出シート：${workbook.SheetNames.join(
            " / "
          )}`,
        },
        { status: 400 }
      );
    }

    if (!itemSheet) {
      return NextResponse.json(
        {
          error: `商品リストシートが見つかりません。検出シート：${workbook.SheetNames.join(
            " / "
          )}`,
        },
        { status: 400 }
      );
    }

    const exhibitionName = getCellText(settingSheet, "B4");
    const startDate = excelDateToDateString(settingSheet["B5"]?.v);
    const endDate = excelDateToDateString(settingSheet["B6"]?.v);
    const exhibitionCategory = getCellText(settingSheet, "B7");
    const shopName = getCellText(settingSheet, "B8");

    if (!exhibitionName) {
      const nearbyValues = ["A4", "B4", "C4", "A5", "B5", "A8", "B8"]
        .map((cell) => `${cell}=${getCellText(settingSheet, cell) || "空欄"}`)
        .join(" / ");

      return NextResponse.json(
        {
          error: `展示会名が未入力です。検出内容：${nearbyValues}`,
        },
        { status: 400 }
      );
    }

    if (!shopName) {
      return NextResponse.json(
        {
          error: `ショップ名が未入力です。B8=${getCellText(
            settingSheet,
            "B8"
          ) || "空欄"}`,
        },
        { status: 400 }
      );
    }

    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .select("id, shop_name")
      .eq("shop_name", shopName)
      .maybeSingle();

    if (shopError) {
      console.error("ショップ取得エラー:", shopError);

      return NextResponse.json(
        { error: "ショップ情報の確認に失敗しました。" },
        { status: 500 }
      );
    }

    if (!shop) {
      return NextResponse.json(
        {
          error: `ショップ「${shopName}」が登録されていません。ショップ名を確認してください。`,
        },
        { status: 400 }
      );
    }

    const range = XLSX.utils.decode_range(
      itemSheet["!ref"] ?? "A1:N1"
    );

    const rows = [];

    for (let row = 4; row <= range.e.r + 1; row++) {
      const itemNo = getCellNumber(itemSheet, `A${row}`);
      const productName = getCellText(itemSheet, `B${row}`);

      if (itemNo === null && !productName) {
        continue;
      }

      if (!productName) {
        return NextResponse.json(
          {
            error: `${row}行目の商品名が未入力です。`,
          },
          { status: 400 }
        );
      }

      const quantity = getCellNumber(itemSheet, `I${row}`);
      const price = getCellNumber(itemSheet, `J${row}`);

      if (quantity === null) {
        return NextResponse.json(
          {
            error: `${row}行目の数量が未入力、または数値ではありません。`,
          },
          { status: 400 }
        );
      }

      if (price === null) {
        return NextResponse.json(
          {
            error: `${row}行目の価格が未入力、または数値ではありません。`,
          },
          { status: 400 }
        );
      }

      rows.push({
        item_no: itemNo,
        product_name: productName,
        category: getCellText(itemSheet, `C${row}`),
        item: getCellText(itemSheet, `D${row}`),
        variety: getCellText(itemSheet, `E${row}`),
        tree_height: getCellText(itemSheet, `F${row}`),
        tree_shape: getCellText(itemSheet, `G${row}`),
        pot_size: getCellText(itemSheet, `H${row}`),
        quantity,
        price,
        origin: getCellText(itemSheet, `K${row}`),
        producer: getCellText(itemSheet, `L${row}`),
        comment: getCellText(itemSheet, `M${row}`),
        jf_code: getCellText(itemSheet, `N${row}`) || null,
        staff: null,
        status: "preparing",
        input_completed: false,
        shop_id: shop.id,
      });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "登録できる商品データがありません。" },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from("exhibitions")
      .update({ is_active: false })
      .eq("is_active", true);

    const { data: exhibition, error: exhibitionError } =
      await supabaseAdmin
        .from("exhibitions")
        .insert({
          name: exhibitionName,
          start_date: startDate,
          end_date: endDate,
          category: exhibitionCategory,
          is_active: true,
        })
        .select("id")
        .single();

    if (exhibitionError || !exhibition) {
      console.error("展示会登録エラー:", exhibitionError);

      return NextResponse.json(
        {
          error:
            exhibitionError?.message ??
            "展示会の登録に失敗しました。",
        },
        { status: 500 }
      );
    }

    const insertRows = rows.map((row) => ({
      ...row,
      exhibition_id: exhibition.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("exhibition_items")
      .insert(insertRows);

    if (itemsError) {
      console.error("商品登録エラー:", itemsError);

      await supabaseAdmin
        .from("exhibitions")
        .delete()
        .eq("id", exhibition.id);

      return NextResponse.json(
        {
          error:
            itemsError.message ??
            "商品の登録に失敗しました。",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Lei Port商品データの取込が完了しました。",
      exhibitionName,
      shopName: shop.shop_name,
      itemCount: insertRows.length,
    });
  } catch (error) {
    console.error("Lei Port Excel取込エラー:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "取込中に予期しないエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}