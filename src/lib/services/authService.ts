import type { Session } from "@supabase/supabase-js";
import { redirect } from "react-router";
import { toast } from "sonner";
import supabase from "../supabase";

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

// Sign in with email
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current user
export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

// Check if user is logged in
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
};

// Get session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

// Set up auth state change listener
export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

// Reset password
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};

// Update password
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

export const protectPage = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    toast.error("You must be logged in to access this page.");
    throw redirect("/login");
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    toast.error("Error fetching profile. Please try again later.");
    throw redirect("/login");
  }

  return {
    user: data.user,
    profile: profileData,
  };
};

export const redirectIfLoggedIn = async () => {
  const { data, error } = await supabase.auth.getUser();
  const id = window.location.pathname.split("/").at(-1);
  const isInvite = window.location.pathname.includes("invite");
  console.log(id, isInvite);

  // If there's an error fetching the user, proceed as if not logged in.
  if (error && !isInvite) return null;

  if (data.user) {
    toast.info("You are already logged in.", {
      description: "Redirecting to dashboard...",
    });
    if (isInvite) {
      const link = "/dashboard/groups?join=" + id;
      throw redirect(link);
    }
    throw redirect("/dashboard");
  } else {
    console.log("heere");
    const link = "/login?redirectTo=/dashboard/groups?join=" + id;
    if (isInvite) {
      window.location.href = link;
      return null;
    }
  }
  return null;
};
