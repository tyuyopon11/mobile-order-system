"use server";

import { revalidatePath } from "next/cache";

import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
} from "@/lib/auth/platform-user";
import { createClient } from "@/lib/supabase/server";

export type MemberActionState = {
  success: boolean;
  message: string;
};

type PlatformAccessResult = Awaited<
  ReturnType<typeof getPlatformAccess>
>;

type ApprovedAdminAccess = PlatformAccessResult & {
  platformUser: NonNullable<
    PlatformAccessResult["platformUser"]
  >;
};

function createErrorState(message: string): MemberActionState {
  return {
    success: false,
    message,
  };
}

function createSuccessState(message: string): MemberActionState {
  return {
    success: true,
    message,
  };
}

async function requireApprovedAdmin(): Promise<
  ApprovedAdminAccess | null
> {
  const access = await getPlatformAccess();

  if (
    !isApprovedPlatformAdmin(access) ||
    !access.platformUser
  ) {
    return null;
  }

  return access as ApprovedAdminAccess;
}

export async function approveMember(
  memberId: string
): Promise<MemberActionState> {
  const access = await requireApprovedAdmin();

  if (!access) {
    return createErrorState(
      "管理者権限を確認できませんでした。"
    );
  }

  if (!memberId.trim()) {
    return createErrorState(
      "承認対象の会員IDが指定されていません。"
    );
  }

  if (memberId === access.platformUser.id) {
    return createErrorState(
      "自分自身の承認状態は変更できません。"
    );
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: targetMember, error: loadError } =
    await supabase
      .from("platform_users")
      .select(
        `
          id,
          approval_status,
          is_active
        `
      )
      .eq("id", memberId)
      .maybeSingle();

  if (loadError) {
    console.error(
      "[Lei Port Admin] Failed to load approval target:",
      loadError.message
    );

    return createErrorState(
      "会員情報の確認中にエラーが発生しました。"
    );
  }

  if (!targetMember) {
    return createErrorState(
      "対象の会員が見つかりませんでした。"
    );
  }

  if (!targetMember.is_active) {
    return createErrorState(
      "利用停止中の会員は承認できません。"
    );
  }

  if (targetMember.approval_status === "approved") {
    return createSuccessState(
      "この会員はすでに承認済みです。"
    );
  }

  const { error: updateError } = await supabase
    .from("platform_users")
    .update({
      approval_status: "approved",
      approved_at: now,
      approved_by: access.platformUser.id,
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null,
      updated_at: now,
    })
    .eq("id", memberId);

  if (updateError) {
    console.error(
      "[Lei Port Admin] Failed to approve member:",
      updateError.message
    );

    return createErrorState(
      "会員を承認できませんでした。"
    );
  }

  revalidatePath("/platform/admin");
  revalidatePath("/platform/admin/members");

  return createSuccessState(
    "会員を承認しました。"
  );
}

export async function rejectMember(
  memberId: string,
  reason: string
): Promise<MemberActionState> {
  const access = await requireApprovedAdmin();

  if (!access) {
    return createErrorState(
      "管理者権限を確認できませんでした。"
    );
  }

  if (!memberId.trim()) {
    return createErrorState(
      "却下対象の会員IDが指定されていません。"
    );
  }

  if (memberId === access.platformUser.id) {
    return createErrorState(
      "自分自身の承認状態は変更できません。"
    );
  }

  const normalizedReason = reason.trim();

  if (!normalizedReason) {
    return createErrorState(
      "却下理由を入力してください。"
    );
  }

  if (normalizedReason.length > 500) {
    return createErrorState(
      "却下理由は500文字以内で入力してください。"
    );
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: targetMember, error: loadError } =
    await supabase
      .from("platform_users")
      .select(
        `
          id,
          approval_status,
          is_active
        `
      )
      .eq("id", memberId)
      .maybeSingle();

  if (loadError) {
    console.error(
      "[Lei Port Admin] Failed to load rejection target:",
      loadError.message
    );

    return createErrorState(
      "会員情報の確認中にエラーが発生しました。"
    );
  }

  if (!targetMember) {
    return createErrorState(
      "対象の会員が見つかりませんでした。"
    );
  }

  if (!targetMember.is_active) {
    return createErrorState(
      "利用停止中の会員は却下できません。"
    );
  }

  const { error: updateError } = await supabase
    .from("platform_users")
    .update({
      approval_status: "rejected",
      approved_at: null,
      approved_by: null,
      rejected_at: now,
      rejected_by: access.platformUser.id,
      rejection_reason: normalizedReason,
      updated_at: now,
    })
    .eq("id", memberId);

  if (updateError) {
    console.error(
      "[Lei Port Admin] Failed to reject member:",
      updateError.message
    );

    return createErrorState(
      "会員申請を却下できませんでした。"
    );
  }

  revalidatePath("/platform/admin");
  revalidatePath("/platform/admin/members");

  return createSuccessState(
    "会員申請を却下しました。"
  );
}