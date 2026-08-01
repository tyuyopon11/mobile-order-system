"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

type ApprovalStatus = "pending" | "approved" | "rejected";

type PlatformUserAccess = {
  approval_status: ApprovalStatus;
  is_active: boolean;
  role: string;
};

function getSafeRedirectPath(value: FormDataEntryValue | null): string {
  const path = String(value ?? "/platform").trim();

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/platform";
  }

  return path;
}

export async function login(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeRedirectPath(formData.get("next"));

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードを入力してください。",
    };
  }

  const supabase = await createClient();

  const {
    data: signInData,
    error: signInError,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData.user) {
    console.error(
      "Login error:",
      signInError?.message ?? "User not returned"
    );

    return {
      error: "メールアドレスまたはパスワードが正しくありません。",
    };
  }

  const { data: platformUser, error: accessError } =
    await supabase
      .from("platform_users")
      .select("approval_status, is_active, role")
      .eq("auth_user_id", signInData.user.id)
      .maybeSingle<PlatformUserAccess>();

  if (accessError) {
    console.error(
      "[Lei Port Login] Failed to load platform user:",
      accessError.message
    );

    await supabase.auth.signOut();

    return {
      error:
        "会員情報を確認できませんでした。時間をおいて再度お試しください。",
    };
  }

  if (!platformUser) {
    await supabase.auth.signOut();

    return {
      error:
        "Lei Portの会員情報が登録されていません。管理者へお問い合わせください。",
    };
  }

  if (!platformUser.is_active) {
    await supabase.auth.signOut();

    return {
      error:
        "このアカウントは現在利用停止中です。管理者へお問い合わせください。",
    };
  }

  if (platformUser.approval_status === "pending") {
    await supabase.auth.signOut();

    return {
      error:
        "現在、利用申請の承認待ちです。管理者の承認後にログインできます。",
    };
  }

  if (platformUser.approval_status === "rejected") {
    await supabase.auth.signOut();

    return {
      error:
        "利用申請が承認されていません。管理者へお問い合わせください。",
    };
  }

  revalidatePath("/", "layout");
  if (platformUser.role === "shop") redirect("/platform/shop");
  if (platformUser.role === "admin" && nextPath === "/platform") redirect("/platform/admin");
  redirect(nextPath);
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
    redirect("/platform");
  }

  revalidatePath("/", "layout");
  redirect("/platform/login");
}
