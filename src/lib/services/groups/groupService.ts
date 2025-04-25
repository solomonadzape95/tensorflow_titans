import type { Group } from "@/types";
import supabase from "../../supabase";

export async function getGroupById(
	groupId: string,
	userId: string,
): Promise<Group> {
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

	if (!data) {
		throw new Error(
			`No data returned from RPC for group ${groupId}. Group might not exist or user may not have access.`,
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
