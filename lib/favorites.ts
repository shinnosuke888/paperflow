import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type FavoritePaper = Database["public"]["Tables"]["favorite_papers"]["Row"];
export type FavoritePreview = Pick<
  FavoritePaper,
  "paper_id" | "title" | "primary_category" | "saved_at" | "arxiv_url"
>;

export async function getFavoriteIds() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("favorite_papers").select("paper_id");

  if (error) {
    throw new Error(error.message);
  }

  return new Set((data ?? []).map((item) => item.paper_id));
}

export async function getFavoritePreview(limit = 6) {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("favorite_papers")
    .select("paper_id, title, primary_category, saved_at, arxiv_url", {
      count: "exact",
    })
    .order("saved_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: (data ?? []) as FavoritePreview[],
    count: count ?? 0,
  };
}

export async function getAllFavorites() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorite_papers")
    .select("*")
    .order("saved_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as FavoritePaper[];
}
