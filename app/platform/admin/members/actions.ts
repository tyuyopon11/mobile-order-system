"use server";

import { revalidatePath } from "next/cache";

import {
  getPlatformAccess,
  isApprovedPlatformAdmin,
} from "@/lib/auth/platform-user";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type MemberActionState = {
  success: boolean;
  message: string;
};

export type ShopManagerFieldErrors = Partial<
  Record<"email" | "name" | "companyName" | "phone" | "shopId" | "password" | "passwordConfirm", string>
>;

export type ShopManagerActionState = MemberActionState & {
  fieldErrors: ShopManagerFieldErrors;
};

const emptyShopManagerState: ShopManagerActionState = {
  success: false,
  message: "",
  fieldErrors: {},
};

type PlatformAccessResult = Awaited<
  ReturnType<typeof getPlatformAccess>
>;

type ApprovedAdminAccess = PlatformAccessResult & {
  platformUser: NonNullable<
    PlatformAccessResult["platformUser"]
  >;
};

type ApproveRpcResult = {
  success?: boolean;
  message?: string;
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

function getFriendlyApprovalError(message: string) {
  if (message.includes("管理者権限")) {
    return "管理者権限を確認できませんでした。";
  }

  if (message.includes("認証情報")) {
    return "対象会員の認証情報を確認できませんでした。";
  }

  if (message.includes("承認待ち")) {
    return "承認待ちではない会員は承認できません。";
  }

  if (message.includes("見つかりません")) {
    return "対象の会員が見つかりませんでした。";
  }

  return "会員を承認できませんでした。";
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

  const normalizedMemberId = memberId.trim();

  if (!normalizedMemberId) {
    return createErrorState(
      "承認対象の会員IDが指定されていません。"
    );
  }

  if (normalizedMemberId === access.platformUser.id) {
    return createErrorState(
      "自分自身の承認状態は変更できません。"
    );
  }

  const { data: approvalTarget, error: approvalTargetError } = await supabaseAdmin
    .from("platform_users")
    .select("role,shop_id")
    .eq("id", normalizedMemberId)
    .maybeSingle();

  if (approvalTargetError || !approvalTarget) {
    return createErrorState("対象の会員情報を確認できませんでした。");
  }

  if (
    (approvalTarget.role === "shop" || approvalTarget.role === "shop_admin") &&
    !approvalTarget.shop_id
  ) {
    return createErrorState("ショップ管理者には管理ショップの設定が必要です。");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "approve_platform_member",
    {
      target_member_id: normalizedMemberId,
    }
  );

  if (error) {
    console.error(
      "[Lei Port Admin] Failed to approve member and confirm email:",
      error.message
    );

    return createErrorState(
      getFriendlyApprovalError(error.message)
    );
  }

  const result = data as ApproveRpcResult | null;

  revalidatePath("/platform/admin");
  revalidatePath("/platform/admin/members");
  revalidatePath("/platform/login");

  return createSuccessState(
    result?.message ?? "会員を承認しました。"
  );
}

function normalizeShopManagerInput(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    name: String(formData.get("name") ?? "").trim(),
    companyName: String(formData.get("companyName") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    shopId: String(formData.get("shopId") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    passwordConfirm: String(formData.get("passwordConfirm") ?? ""),
  };
}

function validateShopManagerInput(
  input: ReturnType<typeof normalizeShopManagerInput>
): ShopManagerFieldErrors {
  const errors: ShopManagerFieldErrors = {};
  if (!input.email) errors.email = "メールアドレスを入力してください。";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.email = "メールアドレスの形式を確認してください。";
  if (!input.name) errors.name = "担当者名を入力してください。";
  else if (input.name.length > 100) errors.name = "担当者名は100文字以内で入力してください。";
  if (!input.companyName) errors.companyName = "会社名を入力してください。";
  else if (input.companyName.length > 200) errors.companyName = "会社名は200文字以内で入力してください。";
  if (input.phone.length > 30) errors.phone = "電話番号は30文字以内で入力してください。";
  if (!input.shopId) errors.shopId = "管理ショップを選択してください。";
  if (input.password.length < 8) errors.password = "初期パスワードは8文字以上で入力してください。";
  else if (input.password.length > 72) errors.password = "初期パスワードは72文字以内で入力してください。";
  if (input.password !== input.passwordConfirm) errors.passwordConfirm = "確認用パスワードが一致しません。";
  return errors;
}

async function shopExists(shopId: string) {
  const { data, error } = await supabaseAdmin.from("shops").select("id").eq("id", shopId).maybeSingle();
  return !error && Boolean(data);
}

export async function createShopManager(
  _previousState: ShopManagerActionState,
  formData: FormData
): Promise<ShopManagerActionState> {
  const access = await requireApprovedAdmin();
  if (!access) return { ...emptyShopManagerState, message: "管理者権限を確認できませんでした。" };

  const input = normalizeShopManagerInput(formData);
  const fieldErrors = validateShopManagerInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ...emptyShopManagerState, message: "入力内容を確認してください。", fieldErrors };
  }
  if (!(await shopExists(input.shopId))) {
    return { ...emptyShopManagerState, message: "選択したショップを確認できませんでした。", fieldErrors: { shopId: "有効なショップを選択してください。" } };
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name, company_name: input.companyName, phone: input.phone || null },
  });
  if (authError || !authData.user) {
    const duplicate = authError?.message.toLowerCase().includes("already") ?? false;
    return {
      ...emptyShopManagerState,
      message: duplicate ? "このメールアドレスはすでに登録されています。" : "ショップ管理者を登録できませんでした。",
      fieldErrors: duplicate ? { email: "登録済みのメールアドレスです。" } : {},
    };
  }

  const now = new Date().toISOString();
  const { data: configuredProfile, error: profileError } = await supabaseAdmin
    .from("platform_users")
    .update({
      email: input.email,
      name: input.name,
      company_name: input.companyName,
      phone: input.phone || null,
      role: "shop",
      shop_id: input.shopId,
      approval_status: "pending",
      is_active: false,
      updated_at: now,
    })
    .eq("auth_user_id", authData.user.id)
    .select("id")
    .maybeSingle();

  if (profileError || !configuredProfile) {
    const { error: cleanupError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    if (cleanupError) console.error("[Lei Port Admin] Failed to clean up Auth user:", cleanupError.message);
    console.error(
      "[Lei Port Admin] Failed to configure shop manager:",
      profileError?.message ?? "platform_users row was not created"
    );
    return { ...emptyShopManagerState, message: "会員情報を設定できなかったため、登録を取り消しました。" };
  }

  revalidatePath("/platform/admin/members");
  return { success: true, message: "ショップ管理者を承認待ちとして登録しました。", fieldErrors: {} };
}

async function loadManagedShopMember(memberId: string) {
  return supabaseAdmin
    .from("platform_users")
    .select("id,role,shop_id,approval_status,is_active")
    .eq("id", memberId)
    .maybeSingle();
}

export async function changeShopAssignment(
  memberId: string,
  _previousState: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const access = await requireApprovedAdmin();
  if (!access) return createErrorState("管理者権限を確認できませんでした。");
  const shopId = String(formData.get("shopId") ?? "").trim();
  if (!shopId || !(await shopExists(shopId))) return createErrorState("有効な管理ショップを選択してください。");
  const { data: member } = await loadManagedShopMember(memberId);
  if (!member || (member.role !== "shop" && member.role !== "shop_admin")) return createErrorState("対象はショップ管理者ではありません。");
  const { error } = await supabaseAdmin.from("platform_users").update({ shop_id: shopId, updated_at: new Date().toISOString() }).eq("id", memberId);
  if (error) return createErrorState("管理ショップを変更できませんでした。");
  revalidatePath(`/platform/admin/members/${memberId}`);
  revalidatePath("/platform/admin/members");
  return createSuccessState("管理ショップを変更しました。");
}

export async function setShopManagerActive(memberId: string, active: boolean): Promise<MemberActionState> {
  const access = await requireApprovedAdmin();
  if (!access) return createErrorState("管理者権限を確認できませんでした。");
  if (memberId === access.platformUser.id) return createErrorState("自分自身の利用状態は変更できません。");
  const { data: member } = await loadManagedShopMember(memberId);
  if (!member || (member.role !== "shop" && member.role !== "shop_admin")) return createErrorState("対象はショップ管理者ではありません。");
  if (active && (member.approval_status !== "approved" || !member.shop_id)) return createErrorState("承認済みで管理ショップが設定された会員だけ再開できます。");
  const { error } = await supabaseAdmin.from("platform_users").update({ is_active: active, updated_at: new Date().toISOString() }).eq("id", memberId);
  if (error) return createErrorState(active ? "利用を再開できませんでした。" : "利用停止にできませんでした。");
  revalidatePath(`/platform/admin/members/${memberId}`);
  revalidatePath("/platform/admin/members");
  return createSuccessState(active ? "ショップ管理者の利用を再開しました。" : "ショップ管理者を利用停止にしました。");
}

export async function releaseShopManagerRole(memberId: string): Promise<MemberActionState> {
  const access = await requireApprovedAdmin();
  if (!access) return createErrorState("管理者権限を確認できませんでした。");
  const { data: member } = await loadManagedShopMember(memberId);
  if (!member || (member.role !== "shop" && member.role !== "shop_admin")) return createErrorState("対象はショップ管理者ではありません。");
  const { error } = await supabaseAdmin.from("platform_users").update({ role: "buyer", shop_id: null, updated_at: new Date().toISOString() }).eq("id", memberId);
  if (error) return createErrorState("ショップ管理者権限を解除できませんでした。");
  revalidatePath(`/platform/admin/members/${memberId}`);
  revalidatePath("/platform/admin/members");
  return createSuccessState("ショップ管理者権限を解除し、Buyerへ変更しました。");
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
          approval_status
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

  if (targetMember.approval_status !== "pending") {
    return createErrorState(
      "承認待ちではない会員は却下できません。"
    );
  }

  const { error: updateError } = await supabase
    .from("platform_users")
    .update({
      approval_status: "rejected",
      is_active: false,
      approved_at: null,
      approved_by: null,
      rejected_at: now,
      rejected_by: access.platformUser.id,
      rejection_reason: normalizedReason,
      updated_at: now,
    })
    .eq("id", memberId)
    .eq("approval_status", "pending");

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
