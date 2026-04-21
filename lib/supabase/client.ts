import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (!browserClient) {
    const { url, publishableKey } = getSupabaseEnv();

    browserClient = createBrowserClient<Database>(url, publishableKey);
  }

  return browserClient;
}
