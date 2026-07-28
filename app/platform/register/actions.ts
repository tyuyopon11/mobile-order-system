"use server";

import { createClient } from "@/lib/supabase/server";

export type RegisterFieldErrors = {
  companyName?: string;
  name?: string;
  buyerNo?: string;
  branchNo?: string;
  phone?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
};

export type RegisterState = {
  success: boolean;
  message: string | null;
  fieldErrors: RegisterFieldErrors;
};

function normalizeOptional(
  value: FormDataEntryValue | null
): string | null {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function validateNumericCode(
  value: string | null,
  label: string
): string | undefined {
  if (!value) {
    return undefined;
  }

  if (!/^[0-9]+$/.test(value)) {
    return `${label}は半角数字で入力してください。`;
  }

  if (value.length > 20) {
    return `${label}は20文字以内で入力してください。`;
  }

  return undefined;
}

export async function register(
  _previousState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const companyName = String(
    formData.get("companyName") ?? ""
  ).trim();

  const name = String(
    formData.get("name") ?? ""
  ).trim();

  const buyerNo = normalizeOptional(
    formData.get("buyerNo")
  );

  const branchNo = normalizeOptional(
    formData.get("branchNo")
  );

  const phone = normalizeOptional(
    formData.get("phone")
  );

  const email = String(
    formData.get("email") ?? ""
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? ""
  );

  const passwordConfirm = String(
    formData.get("passwordConfirm") ?? ""
  );

  const fieldErrors: RegisterFieldErrors = {};

  if (!companyName) {
    fieldErrors.companyName =
      "会社名または屋号を入力してください。";
  } else if (companyName.length > 200) {
    fieldErrors.companyName =
      "会社名・屋号は200文字以内で入力してください。";
  }

  if (!name) {
    fieldErrors.name =
      "担当者名を入力してください。";
  } else if (name.length > 100) {
    fieldErrors.name =
      "担当者名は100文字以内で入力してください。";
  }

  const buyerNoError = validateNumericCode(
    buyerNo,
    "買参番号"
  );

  if (buyerNoError) {
    fieldErrors.buyerNo = buyerNoError;
  }

  const branchNoError = validateNumericCode(
    branchNo,
    "枝番"
  );

  if (branchNoError) {
    fieldErrors.branchNo = branchNoError;
  }

  if (phone && phone.length > 30) {
    fieldErrors.phone =
      "電話番号は30文字以内で入力してください。";
  }

  if (!email) {
    fieldErrors.email =
      "メールアドレスを入力してください。";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    fieldErrors.email =
      "メールアドレスの形式を確認してください。";
  }

  if (!password) {
    fieldErrors.password =
      "パスワードを入力してください。";
  } else if (password.length < 8) {
    fieldErrors.password =
      "パスワードは8文字以上で入力してください。";
  } else if (password.length > 72) {
    fieldErrors.password =
      "パスワードは72文字以内で入力してください。";
  }

  if (!passwordConfirm) {
    fieldErrors.passwordConfirm =
      "確認用パスワードを入力してください。";
  } else if (password !== passwordConfirm) {
    fieldErrors.passwordConfirm =
      "パスワードが一致していません。";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  const {
    data: signUpData,
    error: signUpError,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        company_name: companyName,
        buyer_no: buyerNo,
        branch_no: branchNo,
        phone,
      },
    },
  });

  if (signUpError || !signUpData.user) {
    console.error(
      "[Lei Port Register] Auth sign-up failed:",
      signUpError?.message ?? "User not returned"
    );

    const normalizedMessage =
      signUpError?.message.toLowerCase() ?? "";

    const duplicateAccount =
      normalizedMessage.includes("already registered") ||
      normalizedMessage.includes("already exists") ||
      normalizedMessage.includes("user already");

    const databaseError =
      normalizedMessage.includes("database error") ||
      normalizedMessage.includes("saving new user");

    return {
      success: false,
      message: duplicateAccount
        ? "このメールアドレスはすでに登録されています。"
        : databaseError
          ? "会員情報を登録できませんでした。管理者へお問い合わせください。"
          : "利用申請を登録できませんでした。時間をおいて再度お試しください。",
      fieldErrors: duplicateAccount
        ? {
            email:
              "別のメールアドレスを使用するか、ログイン画面をお試しください。",
          }
        : {},
    };
  }

  /*
   * メール確認が無効な環境では、signUp直後に
   * セッションが発行される場合があります。
   * 承認前の利用を防ぐため、申請完了後は必ずサインアウトします。
   */
  const { error: signOutError } =
    await supabase.auth.signOut();

  if (signOutError) {
    console.error(
      "[Lei Port Register] Sign-out after registration failed:",
      signOutError.message
    );
  }

  return {
    success: true,
    message: null,
    fieldErrors: {},
  };
}
