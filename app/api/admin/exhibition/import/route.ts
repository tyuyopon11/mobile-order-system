import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function getCellText(sheet: XLSX.WorkSheet, cell: string) {
  const value = sheet[cell]?.v;
  return value === undefined || value === null ? "" : String(value).trim();
}

function getCellNumber(sheet: XLSX.WorkSheet, cell: string) {
  const value = sheet[cell]?.v;
  if (value === undefined || value === null || value === "") return null;

  const cleaned = String(value).replace(/,/g, "").trim();
  const num = Number(cleaned);

  return Number.isNaN(num) ? null : num;
}

function excelDateToDateString(value: unknown) {
  if (!value) return null;

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  const text = String(value).trim();

  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(text)) {
    const [y, m, d] = text.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(text)) {
    const [y, m, d] = text.split("-");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
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

    if (!settingSheet) {
      return NextResponse.json(
        { error: "展示会設定シートが見つかりません。" },
        { status: 400 }
      );
    }

    const exhibitionName = getCellText(settingSheet, "B2");
    const startDate = excelDateToDateString(settingSheet["B3"]?.v);
    const endDate = excelDateToDateString(settingSheet["B4"]?.v);
    const category = getCellText(settingSheet, "B5");

    if (!exhibitionName) {
      return NextResponse.json(
        { error: "展示会名が未入力です。" },
        { status: 400 }
      );
    }

    const itemSheetName =
      workbook.SheetNames.find((name) => name !== "展示会設定") ?? "";

    const itemSheet = workbook.Sheets[itemSheetName];

    if (!itemSheet) {
      return NextResponse.json(
        { error: "商品一覧シートが見つかりません。" },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from("exhibitions")
      .update({ is_active: false })
      .eq("is_active", true);

    const { data: exhibition, error: exhibitionError } = await supabaseAdmin
      .from("exhibitions")
      .insert({
        name: exhibitionName,
        start_date: startDate,
        end_date: endDate,
        category,
        is_active: true,
      })
      .select("id")
      .single();

    if (exhibitionError || !exhibition) {
      return NextResponse.json(
        { error: "展示会の登録に失敗しました。" },
        { status: 500 }
      );
    }

    const rows = [];
    const range = XLSX.utils.decode_range(itemSheet["!ref"] ?? "A1:A1");

    for (let row = 14; row <= range.e.r + 1; row++) {
      const itemNo = getCellNumber(itemSheet, `A${row}`);
      const productName = getCellText(itemSheet, `E${row}`);

      if (!itemNo && !productName) continue;

      const note1 = getCellText(itemSheet, `F${row}`);
      const note2 = getCellText(itemSheet, `HN${row}`);
      const comment = [note1, note2].filter(Boolean).join(" / ");

      rows.push({
        exhibition_id: exhibition.id,
        item_no: itemNo,
        product_name: productName,
        spec: getCellText(itemSheet, `G${row}`),
        quantity: getCellNumber(itemSheet, `H${row}`),
        price: getCellNumber(itemSheet, `I${row}`),
        origin: getCellText(itemSheet, `HG${row}`),
        producer: getCellText(itemSheet, `HL${row}`),
        staff: getCellText(itemSheet, `HP${row}`),
        comment,
        status: "preparing",
      });
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "登録できる商品データがありません。" },
        { status: 400 }
      );
    }

    const { error: itemsError } = await supabaseAdmin
      .from("exhibition_items")
      .insert(rows);

    if (itemsError) {
      return NextResponse.json(
        { error: "商品の登録に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "取込が完了しました。",
      exhibitionName,
      itemCount: rows.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "取込中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}