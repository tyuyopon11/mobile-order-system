import { NextRequest, NextResponse } from "next/server";

import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
} from "@/lib/auth/platform-user";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "shop-assets";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type AssetKind = "logo" | "banner";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

function getColumn(kind: AssetKind) {
  return kind === "logo" ? "logo_url" : "banner_url";
}

function getStoragePath(publicUrl: string | null) {
  if (!publicUrl) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) return null;

  return decodeURIComponent(publicUrl.slice(markerIndex + marker.length));
}

function getExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function requireAdmin() {
  const access = await getPlatformAccess();

  if (!isApprovedPlatformAdmin(access) || !access.platformUser) {
    return null;
  }

  return access.platformUser;
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "この操作を行う権限がありません。" },
      { status: 403 }
    );
  }

  const { id: shopId } = await params;
  const formData = await request.formData();
  const kind = String(formData.get("kind") ?? "") as AssetKind;
  const file = formData.get("file");

  if (kind !== "logo" && kind !== "banner") {
    return NextResponse.json(
      { error: "画像種別が正しくありません。" },
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

  const maxBytes = kind === "logo" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;

  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        error:
          kind === "logo"
            ? "ロゴ画像は2MB以下にしてください。"
            : "バナー画像は5MB以下にしてください。",
      },
      { status: 400 }
    );
  }

  const column = getColumn(kind);
  const { data: shop, error: shopError } = await supabaseAdmin
    .from("shops")
    .select(`id,${column}`)
    .eq("id", shopId)
    .maybeSingle();

  if (shopError || !shop) {
    return NextResponse.json(
      { error: "ショップを取得できませんでした。" },
      { status: 404 }
    );
  }

  const filePath = `${shopId}/${kind}-${Date.now()}.${getExtension(file)}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, await file.arrayBuffer(), {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[Lei Port Admin] Shop asset upload failed:", uploadError);
    return NextResponse.json(
      { error: "画像をアップロードできませんでした。" },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(filePath);
  const imageUrl = publicUrlData.publicUrl;
  const now = new Date().toISOString();
  const oldUrl = (shop as unknown as Record<string, string | null>)[column];

  const { error: updateError } = await supabaseAdmin
    .from("shops")
    .update({
      [column]: imageUrl,
      updated_at: now,
      updated_by: admin.id,
    })
    .eq("id", shopId);

  if (updateError) {
    await supabaseAdmin.storage.from(BUCKET).remove([filePath]);
    console.error("[Lei Port Admin] Shop asset DB update failed:", updateError);
    return NextResponse.json(
      { error: "画像情報を保存できませんでした。" },
      { status: 500 }
    );
  }

  const oldPath = getStoragePath(oldUrl);
  if (oldPath) {
    const { error: removeError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([oldPath]);

    if (removeError) {
      console.warn("[Lei Port Admin] Old shop asset removal failed:", removeError);
    }
  }

  return NextResponse.json({ imageUrl });
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "この操作を行う権限がありません。" },
      { status: 403 }
    );
  }

  const { id: shopId } = await params;
  const kind = request.nextUrl.searchParams.get("kind") as AssetKind | null;

  if (kind !== "logo" && kind !== "banner") {
    return NextResponse.json(
      { error: "画像種別が正しくありません。" },
      { status: 400 }
    );
  }

  const column = getColumn(kind);
  const { data: shop, error: shopError } = await supabaseAdmin
    .from("shops")
    .select(`id,${column}`)
    .eq("id", shopId)
    .maybeSingle();

  if (shopError || !shop) {
    return NextResponse.json(
      { error: "ショップを取得できませんでした。" },
      { status: 404 }
    );
  }

  const imageUrl = (shop as unknown as Record<string, string | null>)[column];
  const { error: updateError } = await supabaseAdmin
    .from("shops")
    .update({
      [column]: null,
      updated_at: new Date().toISOString(),
      updated_by: admin.id,
    })
    .eq("id", shopId);

  if (updateError) {
    console.error("[Lei Port Admin] Shop asset delete failed:", updateError);
    return NextResponse.json(
      { error: "画像情報を削除できませんでした。" },
      { status: 500 }
    );
  }

  const storagePath = getStoragePath(imageUrl);
  if (storagePath) {
    const { error: removeError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([storagePath]);

    if (removeError) {
      console.warn("[Lei Port Admin] Shop asset file removal failed:", removeError);
    }
  }

  return NextResponse.json({ success: true });
}
