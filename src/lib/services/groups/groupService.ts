import type { Group } from "@/types";
import supabase from "../../supabase";

export async function getGroupById(
	groupId: string,
	userId: string,
): Promise<Group> {
	// Call the RPC function in Supabase
	const { data, error } = await supabase.rpc(
		"get_group_details_with_balances",
		{
			p_group_id: groupId,
			p_user_id: userId,
		},
	);

	if (error) {
		console.error("Error calling get_group_details_with_balances RPC:", error);
		throw new Error(`Failed to fetch group details for group ${groupId}`);
	}

	// The RPC function returns the data in the shape of the Group type.
	// We might need to handle potential null/undefined cases or do minor adjustments
	// if the SQL JSON construction doesn't perfectly match the TS type,
	// but ideally, it should be close enough for a direct cast.
	// Ensure the returned data structure matches the Group type.
	// Add runtime validation if necessary for robustness.
	if (!data) {
		throw new Error(
			`No data returned from RPC for group ${groupId}. Group might not exist or user may not have access.`,
		);
	}

	// Assuming the RPC returns data matching the Group type structure
	// Perform necessary type casting or validation
	const groupData = data as unknown as Group;

	// Example of potential minor adjustments if needed (e.g., parsing dates)
	// groupData.recentExpenses = groupData.recentExpenses.map(exp => ({
	//   ...exp,
	//   created_at: exp.created_at ? new Date(exp.created_at) : null,
	// }));

	return groupData;
}

// Keep the existing getGroupMembersByGroupId function
export async function getGroupMembersByGroupId(groupId: string) {
	const { data, error: countError } = await supabase
		.from("group_members")
		.select(
			`
        user_id,
        profiles ( full_name, email, avatar_url ),
        groups!inner ( creator_id )
      `,
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
