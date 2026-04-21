import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type AuthClaims = {
  sub?: string;
  email?: string;
};

export async function requireAuth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const typedClaims = (data?.claims ?? null) as AuthClaims | null;

  if (!typedClaims?.sub) {
    redirect("/login");
  }

  return {
    supabase,
    userId: typedClaims.sub,
    userEmail: typedClaims.email ?? "",
  };
}

export async function getOptionalAuth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const typedClaims = (data?.claims ?? null) as AuthClaims | null;

  return {
    supabase,
    userId: typedClaims?.sub ?? null,
    userEmail: typedClaims?.email ?? "",
  };
}
