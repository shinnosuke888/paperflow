"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getBaseUrl } from "@/lib/request";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/utils";

function redirectWithMessage(
  message: string,
  type: "error" | "message",
  redirectTo = "/",
) {
  const params = new URLSearchParams({
    [type]: message,
  });

  if (redirectTo !== "/") {
    params.set("next", redirectTo);
  }

  redirect(`/login?${params.toString()}`);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = getSafeRedirectPath(String(formData.get("redirectTo") ?? "") || undefined);

  if (!email || !password) {
    redirectWithMessage("メールアドレスとパスワードを入力してください。", "error", redirectTo);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirectWithMessage(
      "ログインできませんでした。資格情報とメール確認状態を確認してください。",
      "error",
      redirectTo,
    );
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = getSafeRedirectPath(String(formData.get("redirectTo") ?? "") || undefined);

  if (!email || !password) {
    redirectWithMessage("メールアドレスとパスワードを入力してください。", "error", redirectTo);
  }

  if (password.length < 8) {
    redirectWithMessage("パスワードは 8 文字以上にしてください。", "error", redirectTo);
  }

  const supabase = await createClient();
  const baseUrl = await getBaseUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    redirectWithMessage(error.message, "error", redirectTo);
  }

  if (!data.session) {
    redirectWithMessage(
      "確認メールを送信しました。受信したリンクから登録を完了してください。",
      "message",
      redirectTo,
    );
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}
