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
