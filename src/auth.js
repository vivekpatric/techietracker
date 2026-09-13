import { supabaseClient } from './lib/supabase';
import { setCurrentUser, loadState } from './state';
import { navigate } from './lib/uiBus';
export function authErrorMessage(e){const msg=(e&&e.message)||'';if(/invalid login credentials/i.test(msg))return'Incorrect email or password.';if(/user already registered/i.test(msg))return'An account with that email already exists — try Log In instead.';if(/password.*6 characters/i.test(msg))return'Password should be at least 6 characters.';if(/invalid.*email/i.test(msg))return'That email address looks invalid.';return msg||'Something went wrong.';}
export async function login(email,password){return supabaseClient.auth.signInWithPassword({email,password});}
export async function signup(email,password){return supabaseClient.auth.signUp({email,password});}
export async function forgotPassword(email){return supabaseClient.auth.resetPasswordForEmail(email);}
export async function logout(){const {error}=await supabaseClient.auth.signOut();if(error)console.error('Logout failed',error);}
export async function handleSession(user){setCurrentUser(user);if(user){await loadState();navigate('boot');}else navigate('login');}
