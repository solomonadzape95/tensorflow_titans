import supabase from "../supabase";
import { UserData } from "@/types";
// Get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: UserData) => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
};

// Upload avatar
export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("user-avatars")
    .upload(filePath, file);

  if (uploadError) return { error: uploadError };

  const { data } = supabase.storage.from("user-avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: data.publicUrl })
    .eq("id", userId);

  return { url: data.publicUrl, error: updateError };
};

// Search users by username or email (for adding to groups)
export const searchUsers = async (query: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, avatar_url")
    .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  return { data, error };
};
