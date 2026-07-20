"use server";

import { createClient } from "@/lib/supabase/server";

export type CreateOrderInput = {
  productId: string;
  companyName: string;
  buyerNumber: string;
  contactName: string;
  phone: string;
  email: string;
  deliveryDate: string;
  quantity: number;
  note: string;
};

export type CreateOrderResult =
  | {
      success: true;
      orderId: string;
    }
  | {
      success: false;
      message: string;
    };

type BuyerNumberParts = {
  buyerNo: string;
  branchNo: string | null;
};

function normalizeText(value: string): string {
  return value.trim();
}

function splitBuyerNumber(value: string): BuyerNumberParts {
  const normalized = normalizeText(value);

  /*
   * 「1234-01」のような入力は、
   * buyer_no = 1234
   * branch_no = 01
   * として保存します。
   *
   * ハイフンがない場合は、入力全体をbuyer_noへ保存します。
   */
  const match = normalized.match(/^(.+?)[-－ー](.+)$/);

  if (!match) {
    return {
      buyerNo: normalized,
      branchNo: null,
    };
  }

  return {
    buyerNo: match[1].trim(),
    branchNo: match[2].trim() || null,
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
}

function validateInput(
  input: CreateOrderInput
): CreateOrderResult | null {
  const productId = normalizeText(input.productId);
  const companyName = normalizeText(input.companyName);
  const buyerNumber = normalizeText(input.buyerNumber);
  const contactName = normalizeText(input.contactName);
  const phone = normalizeText(input.phone);
  const email = normalizeText(input.email);
  const deliveryDate = normalizeText(input.deliveryDate);

  if (!productId) {
    return {
      success: false,
      message: "商品情報を確認できませんでした。",
    };
  }

  if (!companyName) {
    return {
      success: false,
      message: "店名・屋号を入力してください。",
    };
  }

  if (!buyerNumber) {
    return {
      success: false,
      message: "買参人番号を入力してください。",
    };
  }

  if (!contactName) {
    return {
      success: false,
      message: "購入担当者名を入力してください。",
    };
  }

  if (!phone) {
    return {
      success: false,
      message: "電話番号を入力してください。",
    };
  }

  if (!email) {
    return {
      success: false,
      message: "メールアドレスを入力してください。",
    };
  }

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: "正しいメールアドレスを入力してください。",
    };
  }

  if (!deliveryDate) {
    return {
      success: false,
      message: "納品・受取希望日を入力してください。",
    };
  }

  if (!isValidDate(deliveryDate)) {
    return {
      success: false,
      message: "納品・受取希望日を正しく入力してください。",
    };
  }

  if (
    !Number.isInteger(input.quantity) ||
    input.quantity < 1
  ) {
    return {
      success: false,
      message: "注文数量を正しく選択してください。",
    };
  }

  return null;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  try {
    const validationError = validateInput(input);

    if (validationError) {
      return validationError;
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message:
          "ログイン情報を確認できませんでした。もう一度ログインしてください。",
      };
    }

    const productId = Number(input.productId);

    if (
      !Number.isSafeInteger(productId) ||
      productId <= 0
    ) {
      return {
        success: false,
        message: "商品情報が正しくありません。",
      };
    }

    const companyName = normalizeText(input.companyName);
    const contactName = normalizeText(input.contactName);
    const phone = normalizeText(input.phone);
    const email = normalizeText(input.email);
    const deliveryDate = normalizeText(
      input.deliveryDate
    );
    const note = normalizeText(input.note);

    const { buyerNo, branchNo } = splitBuyerNumber(
      input.buyerNumber
    );

    /*
     * 保存直前に商品情報と在庫を再確認します。
     * 注文画面を開いた後に売り切れた場合などを防ぎます。
     */
    const {
      data: product,
      error: productError,
    } = await supabase
      .from("exhibition_items")
      .select("id, quantity")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error(
        "Order product fetch error:",
        productError
      );

      return {
        success: false,
        message:
          "商品情報を確認できませんでした。商品ページからやり直してください。",
      };
    }

    const availableQuantity =
      product.quantity === null
        ? null
        : Number(product.quantity);

    if (
      availableQuantity !== null &&
      input.quantity > availableQuantity
    ) {
      return {
        success: false,
        message:
          availableQuantity > 0
            ? `現在注文できる数量は${availableQuantity}点までです。`
            : "申し訳ありません。この商品は売り切れました。",
      };
    }

    const { data: order, error: insertError } =
      await supabase
        .from("exhibition_orders")
        .insert({
          item_id: productId,
          buyer_no: buyerNo,
          branch_no: branchNo,
          buyer_name: companyName,
          contact_name: contactName,
          contact_tel: phone,
          quantity: input.quantity,
          status: "secured",
          cancelled: false,
          email,
          note: note || null,
          delivery_date: deliveryDate,

          /*
           * 既存の展示販売用カラム。
           * 現時点では注文フォームに対応項目がないため、
           * nullで保存します。
           */
          branch: null,
          contact: null,
        })
        .select("id")
        .single();

    if (insertError || !order) {
      console.error("Order insert error:", insertError);

      return {
        success: false,
        message:
          "注文の保存に失敗しました。時間をおいてもう一度お試しください。",
      };
    }

    return {
      success: true,
      orderId: String(order.id),
    };
  } catch (error) {
    console.error("Create order unexpected error:", error);

    return {
      success: false,
      message:
        "注文処理中に予期しないエラーが発生しました。",
    };
  }
}