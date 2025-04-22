import { GroupData } from "@/types";
import type { CreateGroupFormData } from "../schema";
import supabase from "../supabase";
export async function getGroupsForUser(userId: string) {
  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
    group_id,
    groups ( id, name, description, creator_id )
    `
    )
    .eq("user_id", userId);
  const rawGroups =
    (data
      ?.map((item) => item.groups)
      .filter((group) => group !== null) as unknown as GroupData[]) || [];
  for (const group of rawGroups) {
    const { count, error: countError } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", group.id);
    const { count: expenseCount, error: expenseError } = await supabase
      .from("expenses")
      .select("*", { count: "exact", head: true })
      .eq("group_id", group.id);
    console.log("count", expenseCount);
    if (countError || expenseError) {
      console.error(
        `Error fetching member count for group ${group.id}:`,
        countError || expenseError
      );
      group.expenseCount = 0;
      group.memberCount = 0;
    } else {
      group.expenseCount = expenseCount || 0;
      group.memberCount = count || 0;
    }
  }

  if (error) {
    throw error;
  }
  return (
    rawGroups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description || "",
      expenseCount: group.expenseCount || 0,
      balance: group.balance || { amount: 0, isOwed: false },
      memberCount: group.memberCount || 0,
      members: [],
    })) || []
  );
}
export async function getMembersOfMyCreatedGroups(currentUserId: string) {
  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
        user_id,
        profiles ( id, full_name, email, avatar_url ),
        groups!inner ( creator_id )
      `
    )
    .eq("groups.creator_id", currentUserId) // Filter by creator
    .neq("user_id", currentUserId) // Exclude the creator of the group
    .limit(15); // Limit to 15 results cause it currently doesn't make too much sense to show all cause if the user has like 200 members in their groups, it would be a bit overwhelming to scroll through all those members

  if (error) {
    throw error;
  }

  // Extract unique profiles from the results
  const memberProfiles = data
    ?.map((item) => item.profiles)
    .filter((profile) => profile !== null);

  // Ensure uniqueness based on profile ID
  const uniqueMembers = Array.from(
    new Map(memberProfiles?.map((member) => [member?.id, member])).values()
  );

  return uniqueMembers;
}

export async function findUserByEmail(email: string, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("email", email)
    .neq("id", userId) // Exclude the current user
    .single();

  // PGRST116: "Searched for a single row, but found 0 rows" - this is expected if user not found
  // We return null in this case, so we only throw other errors.
  if (error && error.code !== "PGRST116") {
    console.error("Error finding user by email:", error);
    throw error;
  }

  return data;
}

export async function createGroup(
  data: CreateGroupFormData,
  creatorId: string
) {
  console.log(creatorId);

  // 1. Create the group
  const { data: groupData, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: data.name,
      description: data.description,
      creator_id: creatorId,
    })
    .select("id")
    .single();

  if (groupError) {
    throw groupError;
  }

  const groupId = groupData.id;

  const membersToInsert = [
    { group_id: groupId, user_id: creatorId },
    ...data.selectedMembers.map((memberId) => ({
      group_id: groupId,
      user_id: memberId,
    })),
  ];

  const { error: membersError } = await supabase
    .from("group_members")
    .insert(membersToInsert);

  if (membersError) {
    await supabase.from("groups").delete().eq("id", groupId);
    throw membersError;
  }

  return { groupId };
}

export async function fetchBalances(userId: string) {
	const { data, error } = await supabase.rpc("get_user_balances", {
		current_user_id: userId,
	});

	if (error) {
		throw error;
	}

	return data;
}

export async function fetchGroupBalances(userId: string) {
	const { data, error } = await supabase.rpc("get_user_group_balances", {
		p_current_user_id: userId,
	});

	if (error) {
		throw error;
	}

	return data;
}
