import type { CreateGroupFormData, CreateExpenseFormData } from "../schema";
import supabase from "../supabase";

export async function getMembersOfMyCreatedGroups(currentUserId: string) {
	const { data, error } = await supabase
		.from("group_members")
		.select(`
        user_id,
        profiles ( id, full_name, email, avatar_url ),
        groups!inner ( creator_id )
      `)
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
		new Map(memberProfiles?.map((member) => [member?.id, member])).values(),
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
	creatorId: string,
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

export async function getMyGroups(userId: string) {
  const { data, error } = await supabase
    .from("group_members")
    .select(`
      groups (
        id,
        name,
        description,
        creator_id,
        created_at
      )
    `)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
  const groups = data?.map((item) => item.groups).filter(Boolean);
  return groups;
}

export async function getMembersOfMyGroups(userId: string, groupId: string) {
  const { data, error } = await supabase
    .from("group_members")
    .select(`
      user_id,
      profiles (id, full_name, email, avatar_url)
    `)
    .eq("group_id", groupId);

  if (error) {
    throw error;
  }

  const memberProfiles = data
    ?.map((item) => item.profiles)
    .filter((profile) => profile !== null);

  return memberProfiles;
}

export async function createExpense(formData: CreateExpenseFormData, creatorId: string) {
  const { data: expenseData, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      description: formData.description,
      amount: formData.amount,
      date: formData.date,
      group_id: formData.groupId,
      category: formData.category,
      notes: formData.notes,
      created_by: creatorId,
      paid_by: formData.paidBy || creatorId, // If 'formData.paidBy' is not provided, default 'paid_by' to 'creatorId'
    })
    .select("id")
    .single();

  if (expenseError) {
    throw expenseError;
  }

  const expenseId = expenseData.id;

  return { expenseId };
  
}