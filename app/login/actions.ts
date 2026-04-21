"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getBaseUrl } from "@/lib/request";
import { createClient } from "@/lib/supabase/server";

function redirectWithMessage(message: string, type: "error" | "message") {
  redirect(`/login?${type}=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithMessage("メールアドレスとパスワードを入力してください。", "error");
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
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirectWithMessage("メールアドレスとパスワードを入力してください。", "error");
  }

  if (password.length < 8) {
    redirectWithMessage("パスワードは 8 文字以上にしてください。", "error");
  }

  const supabase = await createClient();
  const baseUrl = await getBaseUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/confirm`,
    },
  });

  if (error) {
    redirectWithMessage(error.message, "error");
  }

  if (!data.session) {
    redirectWithMessage(
      "確認メールを送信しました。受信したリンクから登録を完了してください。",
      "message",
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}
