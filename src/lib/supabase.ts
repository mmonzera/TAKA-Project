import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasCredentials = !!(supabaseUrl && supabaseAnonKey);

if (!hasCredentials) {
  console.warn(
    "⚠️ Supabase credentials missing. Auth will not work. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Create a noop supabase client when credentials missing to avoid fetch errors
function createSafeClient() {
  if (hasCredentials) {
    return createClient(supabaseUrl!, supabaseAnonKey!);
  }

  // Return a mock client that won't throw fetch errors
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: "Supabase not configured" } }),
      signOut: async () => {},
    },
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => Promise.resolve({ data: [], error: null }),
        neq: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => Promise.resolve({ error: null }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
        neq: () => Promise.resolve({ error: null }),
      }),
    }),
  } as any;
}

export const supabase = createSafeClient();
