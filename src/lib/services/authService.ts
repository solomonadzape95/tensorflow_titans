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
	callback: (event: string, session: Session | null) => void,
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
	const { data, error } = await supabase.auth.getSession();

	if (error || !data) {
		toast.error("Error fetching session. Please try again later.");
		throw redirect("/login");
	}

	if (!data.session) {
		toast.error("You must be logged in to access this page.");
		throw redirect("/login");
	}

	// Get profile
	const { data: profileData, error: profileError } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", data.session.user.id)
		.single();

	if (profileError) {
		toast.error("Error fetching profile. Please try again later.");
		throw redirect("/login");
	}

	return {
		user: data.session.user,
		profile: profileData,
	};
};
