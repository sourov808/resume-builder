import { supabase } from "./supabase";

/**
 * Proxy utility to check authentication status before proceeding to restricted actions.
 * If user is not authenticated, it can trigger the auth modal or redirect.
 */
export async function authProxy(onSuccess: () => void, onAuthRequired: () => void) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    onSuccess();
  } else {
    onAuthRequired();
  }
}
