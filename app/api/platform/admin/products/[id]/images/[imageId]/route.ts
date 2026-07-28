import { NextRequest, NextResponse } from "next/server";

import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
} from "@/lib/auth/platform-user";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "exhibition-images";

type RouteProps = {
  params: Promise<{
    id: string;
    imageId: string;
  }>;
};

function getStoragePath(publicUrl: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  return index === -1
    ? null
    : decodeURIComponent(publicUrl.slice(index + marker.length));
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteProps
) {
  const access = await getPlatformAccess();

  if (!isApprovedPlatformAdmin(access)) {
    return NextResponse.json(
      { error: "この操作を行う権限がありません。" },
      { status: 403 }
    );
  }

  const { id, imageId } = await params;
  const productId = Number(id);
  const numericImageId = Number(imageId);
  const { data: image, error: fetchError } = await supabaseAdmin
    .from("exhibition_images")
    .select("id,image_url")
    .eq("id", numericImageId)
    .eq("item_id", productId)
    .maybeSingle();

  if (fetchError || !image) {
    return NextResponse.json(
      { error: "削除する画像を確認できませんでした。" },
      { status: 404 }
    );
  }

  const { error: deleteError } = await supabaseAdmin
    .from("exhibition_images")
    .delete()
    .eq("id", numericImageId)
    .eq("item_id", productId);

  if (deleteError) {
    return NextResponse.json(
      { error: "画像情報を削除できませんでした。" },
      { status: 500 }
    );
  }

  const storagePath = getStoragePath(image.image_url);
  if (storagePath) {
    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([storagePath]);

    if (storageError) {
      console.warn(
        "[Lei Port Admin] Product image file removal failed:",
        storageError
      );
    }
  }

  const { data: remainingImages } = await supabaseAdmin
    .from("exhibition_images")
    .select("id")
    .eq("item_id", productId)
    .order("sort_order", { ascending: true });

  await Promise.all(
    (remainingImages ?? []).map((remaining, index) =>
      supabaseAdmin
        .from("exhibition_images")
        .update({ sort_order: index })
        .eq("id", remaining.id)
    )
  );

  return NextResponse.json({ success: true });
}
