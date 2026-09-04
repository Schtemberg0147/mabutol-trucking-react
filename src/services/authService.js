// services/authService.js
import { supabase } from "./supabaseClient";

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    await supabase.auth.signOut();
    throw new Error('Unable to verify account. Please try again.');
  }

  if (!['admin', 'staff'].includes(profile.role)) {
    await supabase.auth.signOut();
    throw new Error('Invalid login credentials');
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    throw new Error('This account has been deactivated.');
  }

  return { ...data, role: profile.role };
}