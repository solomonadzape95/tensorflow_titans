import { Group } from "@/types";
import supabase from "../../supabase";
import {
  addGroupData,
  getAllGroupsWithMembers,
} from "@/lib/services/offlineExpenses";

export async function getGroupById(groupId: string) {
  try {
    // Fetch group data from Supabase
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

    if (groupError) throw groupError;

    const { data: membersData, error: membersError } = await supabase
      .from("group_members")
      .select(
        `
        user_id,
        profiles ( id, full_name )
      `
      )
      .eq("group_id", groupId);

    if (membersError) throw membersError;

    const members = membersData.map((member) => ({
      id: String(member.profiles.id),
      name: member.profiles.full_name,
      initials: member.profiles.full_name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
    }));

    const group: Group = {
      ...data,
      description: data.description ?? "",
      members,
      expenses: 0,
      balance: 0,
      youOwe: false,
      settled: false,
    };

    // Store group and members in IndexedDB
    await addGroupData({
      id: group.id,
      name: group.name,
      description: group.description,
      members: [],
      group_members: members.map((member) => ({
        user_id: member.id,
        name: member.name,
        email: "", // Email is not fetched here
        initials: member.initials,
      })),
      expenses: group.expenses,
      balance: group.balance,
      youOwe: group.youOwe,
      settled: group.settled,
    });

    return group;
  } catch (error) {
    console.error("Error fetching group from Supabase:", error);

    // Fallback to IndexedDB if Supabase fails
    const offlineGroups = await getAllGroupsWithMembers();
    const group = offlineGroups.find((g) => g.id === groupId);

    if (!group) {
      throw new Error("Group not found in offline storage");
    }

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      members: group.group_members.map((member) => ({
        id: member.user_id,
        name: member.name,
        initials: member.initials,
      })),
      expenses: group.expenses,
      balance: group.balance,
      youOwe: group.youOwe,
      settled: group.settled,
    };
  }
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
