import type { CreateGroupFormData } from "../schema";
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

export async function fetchBalances(userId: string) {
	const { data, error } = await supabase.rpc("get_user_balances", {
		current_user_id: userId,
	});

	if (error) {
		console.error("Error fetching balances:", error);
		throw error;
	}

	console.log("User Balances:", data); // Log user balances

	return data;
}

export async function fetchGroupBalances(userId: string) {
	const { data, error } = await supabase.rpc("get_user_group_balances", {
		p_current_user_id: userId,
	});

	if (error) {
		console.error("Error fetching group balances:", error);
		throw error;
	}

	console.log("Group Balances:", data); // Log group balances

	return data;
}
