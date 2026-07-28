"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPlatformAccess } from "@/lib/auth/platform-user";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

function getSafeRedirectPath(
  value: FormDataEntryValue | null
): string {
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
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeRedirectPath(formData.get("next"));

  if (!email || !password) {
    return {
      error: "メールアドレスとパスワードを入力してください。",
    };
  }

  const supabase = await createClient();

  const { error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError) {
    console.error(
      "[Lei Port] Login failed:",
      signInError.message
    );

    return {
      error:
        "メールアドレスまたはパスワードが正しくありません。",
    };
  }

  const access = await getPlatformAccess();

  console.info("[Lei Port] Login access result:", {
    state: access.state,
    authUserId: access.authUserId,
    role: access.platformUser?.role ?? null,
  });

  revalidatePath("/", "layout");

  if (access.state !== "approved") {
    redirect("/platform/account-status");
  }

  redirect(nextPath);
}

export async function logout() {
  const supabase = await createClient();

  const { error: signOutError } =
    await supabase.auth.signOut();

  if (signOutError) {
    console.error(
      "[Lei Port] Logout failed:",
      signOutError.message
    );

    redirect("/platform");
  }

  revalidatePath("/", "layout");
  redirect("/platform/login");
}