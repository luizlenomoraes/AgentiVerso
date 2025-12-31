import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  // Only create client on the browser side, not during SSR/prerendering
  if (typeof window === "undefined") {
    // Return a dummy client during SSR that will be replaced on hydration
    return null as unknown as ReturnType<typeof createBrowserClient>
  }

  if (client) {
    return client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided")
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  return client
}
