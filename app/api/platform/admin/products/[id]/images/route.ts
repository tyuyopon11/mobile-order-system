import { NextRequest, NextResponse } from "next/server";

import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
} from "@/lib/auth/platform-user";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "exhibition-images";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGES = 6;
const MAX_BYTES = 5 * 1024 * 1024;

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

async function isAdmin() {
  const access = await getPlatformAccess();
  return isApprovedPlatformAdmin(access);
}

function extensionFor(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "この操作を行う権限がありません。" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const productId = Number(id);
  const formData = await request.formData();
  const file = formData.get("file");

  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json(
      { error: "商品を特定できませんでした。" },
      { status: 400 }
    );
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "画像ファイルを選択してください。" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "JPEG、PNG、WebP形式の画像を選択してください。" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "画像は5MB以下にしてください。" },
      { status: 400 }
    );
  }

  const { data: existingImages, error: imagesError } = await supabaseAdmin
    .from("exhibition_images")
    .select("id,sort_order")
    .eq("item_id", productId)
    .order("sort_order", { ascending: true });

  if (imagesError) {
    return NextResponse.json(
      { error: "登録済み画像を確認できませんでした。" },
      { status: 500 }
    );
  }

  if ((existingImages?.length ?? 0) >= MAX_IMAGES) {
    return NextResponse.json(
      { error: `商品画像は最大${MAX_IMAGES}枚です。` },
      { status: 400 }
    );
  }

  const filePath = `${productId}/${Date.now()}.${extensionFor(file)}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, await file.arrayBuffer(), {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[Lei Port Admin] Product image upload failed:", uploadError);
    return NextResponse.json(
      { error: "画像をアップロードできませんでした。" },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(filePath);
  const sortOrder = existingImages?.length ?? 0;
  const { data: image, error: insertError } = await supabaseAdmin
    .from("exhibition_images")
    .insert({
      item_id: productId,
      image_url: publicUrlData.publicUrl,
      sort_order: sortOrder,
    })
    .select("id,image_url,sort_order")
    .single();

  if (insertError || !image) {
    await supabaseAdmin.storage.from(BUCKET).remove([filePath]);
    console.error("[Lei Port Admin] Product image insert failed:", insertError);
    return NextResponse.json(
      { error: "画像情報を保存できませんでした。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ image });
}

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "この操作を行う権限がありません。" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const productId = Number(id);
  const body = (await request.json()) as { imageIds?: unknown };
  const imageIds = Array.isArray(body.imageIds)
    ? body.imageIds.map(Number)
    : [];

  if (
    !Number.isInteger(productId) ||
    productId <= 0 ||
    imageIds.length === 0 ||
    imageIds.length > MAX_IMAGES ||
    imageIds.some((imageId) => !Number.isInteger(imageId) || imageId <= 0) ||
    new Set(imageIds).size !== imageIds.length
  ) {
    return NextResponse.json(
      { error: "画像の並び順が正しくありません。" },
      { status: 400 }
    );
  }

  const { data: currentImages, error: currentError } = await supabaseAdmin
    .from("exhibition_images")
    .select("id")
    .eq("item_id", productId);
  const currentIds = (currentImages ?? []).map((image) => Number(image.id));

  if (
    currentError ||
    currentIds.length !== imageIds.length ||
    currentIds.some((imageId) => !imageIds.includes(imageId))
  ) {
    return NextResponse.json(
      { error: "登録済み画像と並び順が一致しません。" },
      { status: 400 }
    );
  }

  const results = await Promise.all(
    imageIds.map((imageId, index) =>
      supabaseAdmin
        .from("exhibition_images")
        .update({ sort_order: index })
        .eq("id", imageId)
        .eq("item_id", productId)
    )
  );

  if (results.some((result) => result.error)) {
    console.error(
      "[Lei Port Admin] Product image reorder failed:",
      results.find((result) => result.error)?.error
    );
    return NextResponse.json(
      { error: "画像を並び替えできませんでした。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
