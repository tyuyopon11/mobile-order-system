import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function nullableText(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const text = String(value).trim();

  return text === "" ? null : text;
}

function nullableNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const text = String(value).trim();

  if (text === "") {
    return null;
  }

  const numberValue = Number(text);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const itemId = Number(id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return NextResponse.json(
        {
          error: "商品IDが正しくありません。",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const productName = nullableText(body.product_name);
    const quantity = nullableNumber(body.quantity);
    const price = nullableNumber(body.price);

    if (!productName) {
      return NextResponse.json(
        {
          error: "商品名を入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    if (quantity !== null && (!Number.isInteger(quantity) || quantity < 0)) {
      return NextResponse.json(
        {
          error: "数量は0以上の整数で入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    if (price !== null && price < 0) {
      return NextResponse.json(
        {
          error: "価格は0以上で入力してください。",
        },
        {
          status: 400,
        }
      );
    }

    const updateData = {
      item_no: nullableText(body.item_no),
      product_name: productName,
      category: nullableText(body.category),
      item: nullableText(body.item),
      variety: nullableText(body.variety),
      tree_height: nullableText(body.tree_height),
      tree_shape: nullableText(body.tree_shape),
      pot_size: nullableText(body.pot_size),
      quantity,
      price,
      origin: nullableText(body.origin),
      producer: nullableText(body.producer),
      staff: nullableText(body.staff),
      comment: nullableText(body.comment),
      jf_code: nullableText(body.jf_code),
    };

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exhibition_items")
      .update(updateData)
      .eq("id", itemId)
      .select("id")
      .single();

    if (error) {
      console.error("Exhibition item update error:", error);

      return NextResponse.json(
        {
          error: "データベースの更新に失敗しました。",
        },
        {
          status: 500,
        }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: "更新対象の商品が見つかりません。",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      itemId: data.id,
    });
  } catch (error) {
    console.error("Exhibition item API error:", error);

    return NextResponse.json(
      {
        error: "商品情報の更新中にエラーが発生しました。",
      },
      {
        status: 500,
      }
    );
  }
}