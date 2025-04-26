import type { Group } from "@/types";
import supabase from "../../supabase";

export async function getGroupById(
  groupId: string,
  userId: string
): Promise<Group> {
  const { data, error } = await supabase.rpc(
    "get_group_details_with_balances",
    {
      p_group_id: groupId,
      p_user_id: userId,
    }
  );

  if (error) {
    console.error("Error calling get_group_details_with_balances RPC:", error);
    throw new Error(`Failed to fetch group details for group ${groupId}`);
  }

  if (!data) {
    throw new Error(
      `No data returned from RPC for group ${groupId}. Group might not exist or user may not have access.`
    );
  }

  const groupData = data as unknown as Group;

  return groupData;
}

export async function getGroupMembersByGroupId(groupId: string) {
  const { data, error: countError } = await supabase
    .from("group_members")
    .select(
      `
        user_id,
        profiles ( full_name, email, avatar_url ),
        groups!inner ( creator_id )
      `
    )
    .eq("group_id", groupId);
  if (countError) {
    throw countError;
  }
  const group_members = data.map((item) => {
    return {
      id: item.user_id,
      name: item.profiles.full_name,
      email: item.profiles.email,
      avatar_url: item.profiles.avatar_url,
    };
  });
  return group_members;
}
export async function updateGroup(
  groupId: string,
  data: { name: string; description: string }
) {
  const { data: result, error } = await supabase
    .from("groups")
    .update({
      name: data.name,
      description: data.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", groupId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update group: ${error.message}`);
  }

  return result;
}
export async function leaveGroup(
  groupId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Failed to leave the group.");
  }
}
export async function deleteGroup(
  groupId: string,
  creatorId: string
): Promise<void> {
  leaveGroup(groupId, creatorId);
  const { error: deleteGroupError } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId);

  if (deleteGroupError) {
    throw new Error(`Failed to delete the group: ${deleteGroupError.message}`);
  }
}
export async function getGroupNameAndCreator(groupId: string): Promise<{
  groupName: string;
  creatorName: string;
  createdAt: string;
}> {
  const { data, error } = await supabase
    .from("groups")
    .select(
      `
      name,
      creator_id,
      created_at,
      profiles!creator_id ( full_name )
    `
    )
    .eq("id", groupId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch group name and creator: ${error.message}`);
  }

  if (!data) {
    throw new Error(`No data found for group with ID: ${groupId}`);
  }

  return {
    groupName: data.name,
    creatorName: data.profiles.full_name,
    createdAt: data.created_at || "",
  };
}
