import { Group, Topic } from "@/types";
import supabase from "../supabase";

export const createGroup = async (groupData: Group) => {
  const { data, error } = await supabase
    .from("groups")
    .insert([groupData])
    .select()
    .single();

  // If group created successfully, add creator as a member and admin
  if (data && !error) {
    await supabase.from("group_members").insert([
      {
        group_id: data.id,
        user_id: groupData.created_by,
        role: "admin",
        joined_at: new Date().toISOString(),
      },
    ]);
  }

  return { data, error };
};

// Get all groups for a user
export const getUserGroups = async (userId: string) => {
  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
      group_id,
      role,
      groups:group_id (
        id,
        name,
        created_at,
        created_by
      )
    `
    )
    .eq("user_id", userId);

  return {
    data: data?.map((item) => ({
      ...item.groups,
      role: item.role,
    })),
    error,
  };
};

// Get a single group with details
export const getGroupDetails = async (groupId: string) => {
  const { data, error } = await supabase
    .from("groups")
    .select(
      `
      *,
      members:group_members (
        user_id,
        role,
        joined_at,
        users:user_id (
          username,
          email,
          avatar_url
        )
      ),
      topics (
        id,
        name,
        created_at,
        created_by
      )
    `
    )
    .eq("id", groupId)
    .single();

  return { data, error };
};

// Update group details
export const updateGroup = async (groupId: string, updates: Group) => {
  const { data, error } = await supabase
    .from("groups")
    .update(updates)
    .eq("id", groupId)
    .select()
    .single();

  return { data, error };
};

// Delete a group
export const deleteGroup = async (groupId: string) => {
  const { error } = await supabase.from("groups").delete().eq("id", groupId);

  return { error };
};

// Add members to a group
export const addGroupMember = async (
  groupId: string,
  userId: string,
  role = "member"
) => {
  const { data, error } = await supabase
    .from("group_members")
    .insert([
      {
        group_id: groupId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  return { data, error };
};

// Update member role
export const updateMemberRole = async (
  groupId: string,
  userId: string,
  role: string
) => {
  const { data, error } = await supabase
    .from("group_members")
    .update({ role })
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .select()
    .single();

  return { data, error };
};

// Remove member from group
export const removeGroupMember = async (groupId: string, userId: string) => {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  return { error };
};

// Create a topic in a group
export const createTopic = async (topicData: Topic) => {
  const { data: topic, error } = await supabase
    .from("topics")
    .insert([topicData])
    .select()
    .single();

  return { data: topic, error };
};

// Get topics for a group
export const getGroupTopics = async (groupId: string) => {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("group_id", groupId);

  return { data, error };
};
