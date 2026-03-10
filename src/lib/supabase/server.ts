import { createServerClient } from "@supabase/ssr";

export function createSupabaseServerClient(Astro: any) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return Astro.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          Astro.cookies.set(name, value, options);
        },
        remove(name: string, options: any) {
          Astro.cookies.delete(name, options);
        }
      }
    }
  );
}