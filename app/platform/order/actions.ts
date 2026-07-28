"use server";

import { createClient } from "@/lib/supabase/server";
import {
  auctionCutoffAt,
  auctionWeekday,
} from "@/lib/orders/auction-dates";

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
      .select(`
        id,
        quantity,
        irisu,
        shop_id,
        shops (
          contact_email,
          ordering_enabled,
          accepts_tuesday,
          accepts_saturday,
          order_cutoff_hours
        )
      `)
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
    const salesUnit = "case";
    const unitsPerSalesUnit = Math.max(
      1,
      Math.trunc(Number(product.irisu ?? 1))
    );

    const shopRelation = Array.isArray(product.shops)
      ? product.shops[0]
      : product.shops;
    const auctionDate = new Date(`${deliveryDate}T00:00:00+09:00`);
    const auctionDay = auctionWeekday(deliveryDate);
    const acceptsAuctionDay =
      (auctionDay === 2 && shopRelation?.accepts_tuesday) ||
      (auctionDay === 6 && shopRelation?.accepts_saturday);

    const {
      data: configuredAuctionDate,
      error: configuredAuctionDateError,
    } = await supabase
      .from("auction_dates")
      .select("auction_date")
      .eq("auction_date", deliveryDate)
      .eq("is_active", true)
      .maybeSingle();

    const auctionDatesTableMissing =
      configuredAuctionDateError?.code === "42P01" ||
      configuredAuctionDateError?.message
        .toLowerCase()
        .includes("auction_dates");

    if (configuredAuctionDateError && !auctionDatesTableMissing) {
      console.error(
        "Auction date validation error:",
        configuredAuctionDateError
      );
      return {
        success: false,
        message: "競り日情報を確認できませんでした。時間をおいて再度お試しください。",
      };
    }

    if (
      !shopRelation?.ordering_enabled ||
      !deliveryDate ||
      Number.isNaN(auctionDate.getTime()) ||
      !acceptsAuctionDay ||
      (!auctionDatesTableMissing && !configuredAuctionDate)
    ) {
      return {
        success: false,
        message: "このショップが受付している競り日（火曜・土曜）を選択してください。",
      };
    }

    const cutoffAt = auctionCutoffAt(
      deliveryDate,
      Number(shopRelation.order_cutoff_hours ?? 24)
    );
    if (Date.now() >= cutoffAt.getTime()) {
      return {
        success: false,
        message: "この競り日の注文受付は締め切りました。",
      };
    }

    const { data: orderNumber, error: orderNumberError } =
      await supabase.rpc("next_lei_port_order_number", {
        p_auction_date: deliveryDate,
      });

    if (orderNumberError || !orderNumber) {
      console.error("Order number generation error:", orderNumberError);
      return {
        success: false,
        message: "注文番号を発行できませんでした。時間をおいて再度お試しください。",
      };
    }

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
          irisu: unitsPerSalesUnit,
          sales_unit: salesUnit,
          units_per_sales_unit: unitsPerSalesUnit,
          total_units: input.quantity * unitsPerSalesUnit,
          status: "secured",
          cancelled: false,
          email,
          note: note || null,
          auction_date: deliveryDate,
          order_number: orderNumber,
          delivery_date: null,

          /*
           * 既存の展示販売用カラム。
           * 現時点では注文フォームに対応項目がないため、
           * nullで保存します。
           */
          branch: null,
          contact: null,
        })
        .select("id,order_number")
        .single();

    if (insertError || !order) {
      console.error("Order insert error:", insertError);

      return {
        success: false,
        message:
          "注文の保存に失敗しました。時間をおいてもう一度お試しください。",
      };
    }

    if (shopRelation?.contact_email) {
      const { error: notificationError } = await supabase
        .from("order_email_notifications")
        .insert({
          order_id: order.id,
          recipient: shopRelation.contact_email,
          status: "pending",
        });
      if (notificationError) {
        console.error("Order email queue insert error:", notificationError);
      }
    }

    return {
      success: true,
      orderId: order.order_number ?? String(order.id),
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
