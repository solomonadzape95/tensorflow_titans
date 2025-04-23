import { Group } from "@/types";
import supabase from "../../supabase";
import {
  addGroupData,
  getGroupByIdFromIndexedDB,
  getGroupMembersFromIndexedDB,
  GroupMember,
} from "@/lib/services/offlineExpenses";

export async function getGroupById(groupId: string) {
  try {
    // First check if online - use navigator.onLine check
    const isOnline = navigator.onLine;

    // If offline, try to get from IndexedDB first
    if (!isOnline) {
      const offlineGroup = await getGroupByIdFromIndexedDB(groupId);
      if (offlineGroup) {
        console.log("Retrieved group from offline storage:", offlineGroup);
        return offlineGroup;
      }
      throw new Error("Group not found in offline storage and you are offline");
    }

    // If online, fetch from Supabase and store in IndexedDB for offline use
    const { data, error: groupError } = await supabase
      .from("groups")
      .select(
        `
        id,
        name,
        description,
        creator_id
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
        profiles ( id, full_name, email, avatar_url )
      `
      )
      .eq("group_id", groupId);

    if (membersError) throw membersError;

    console.log("Raw member data from Supabase:", membersData);

    // Process members data ensuring all required fields are present
    const members = membersData.map((member) => ({
      id: String(member.profiles.id),
      name: member.profiles.full_name,
      email: member.profiles.email || "",
      avatar_url: member.profiles.avatar_url || "",
      initials: member.profiles.full_name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase(),
    }));

    // Format members data for IndexedDB storage
    const groupMembers: GroupMember[] = members.map((member) => ({
      user_id: member.id,
      name: member.name,
      email: member.email || "",
      avatar_url: member.avatar_url || "",
      initials: member.initials,
    }));

    // Get expense count for this group
    const { count: expenseCount, error: expenseError } = await supabase
      .from("expenses")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);
    if (expenseError) throw expenseError;
    const group: Group = {
      id: data.id,
      name: data.name,
      description: data.description ?? "",
      members,
      expenses: expenseCount || 0,
      balance: 0,
      youOwe: false,
      settled: false,
    };

    // Store complete group data in IndexedDB
    console.log("Storing group with members:", group);
    console.log("Members data for storage:", groupMembers);

    await addGroupData({
      id: group.id,
      name: group.name,
      description: group.description,
      members: [],
      group_members: groupMembers,
      expenses: group.expenses,
      balance: group.balance,
      youOwe: group.youOwe,
      settled: group.settled,
    });

    return group;
  } catch (error) {
    console.error("Error fetching group:", error);

    // Fallback to IndexedDB if Supabase fails
    try {
      const offlineGroup = await getGroupByIdFromIndexedDB(groupId);

      if (!offlineGroup) {
        throw new Error("Group not found in offline storage");
      }

      return offlineGroup;
    } catch (dbError) {
      console.error("Error retrieving from IndexedDB:", dbError);
      throw new Error(
        `Failed to get group: ${error}. IndexedDB error: ${dbError}`
      );
    }
  }
}

export async function getGroupMembersByGroupId(groupId: string) {
  try {
    // First check if online
    const isOnline = navigator.onLine;

    // If offline, try to get from IndexedDB
    if (!isOnline) {
      const members = await getGroupMembersFromIndexedDB(groupId);
      if (members && members.length > 0) {
        return members.map((member) => ({
          id: member.user_id,
          name: member.name,
          email: member.email || "",
          avatar_url: member.avatar_url || "",
        }));
      }
      throw new Error(
        "Group members not found in offline storage and you are offline"
      );
    }

    // If online, fetch from Supabase
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
  } catch (error) {
    console.error("Error fetching group members:", error);

    // Fallback to IndexedDB
    const members = await getGroupMembersFromIndexedDB(groupId);

    if (!members || members.length === 0) {
      throw new Error("Group members not found in offline storage");
    }

    return members.map((member) => ({
      id: member.user_id,
      name: member.name,
      email: member.email || "",
      avatar_url: member.avatar_url || "",
    }));
  }
}

// Function to sync offline expenses to Supabase when online
export async function syncOfflineExpensesToSupabase() {
  // This function will be implemented separately
  // It should use getUnsyncedExpenses and markExpenseAsSynced
}
