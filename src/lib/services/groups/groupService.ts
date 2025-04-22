import { Group } from "@/types";
import supabase from "../../supabase";
export async function getGroupById(groupId: string) {
  const { data, error: groupError } = await supabase
    .from("groups")
    .select(
      `
    id,
    name,
    description,
    creator_id,
    group_members ( user_id )
  `
    )
    .eq("id", groupId)
    .single();
  if (groupError) {
    throw groupError;
  }
  const { data: membersData, error: membersError } = await supabase
    .from("group_members")
    .select(
      `
      user_id,
      profiles ( id, full_name )
    `
    )
    .eq("group_id", groupId);

  if (membersError) {
    throw membersError;
  }

  const members = membersData.map((member) => ({
    id: String(member.profiles.id),
    name: member.profiles.full_name,
    initials: member.profiles.full_name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase(),
  }));
  if (membersError) {
    throw membersError;
  }
  const group: Group = {
    ...data,
    description: data.description ?? "",
    members,
    expenses: 0,
    balance: 0,
    youOwe: false,
    settled: false,
  };
  return group;
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
