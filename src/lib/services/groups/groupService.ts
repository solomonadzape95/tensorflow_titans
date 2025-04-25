import type { Group } from "@/types";
import supabase from "../../supabase";

export async function getGroupById(
	groupId: string,
	userId: string,
): Promise<Group> {
	// 1. Fetch basic group details (including creator_id) first
	const { data: groupData, error: groupError } = await supabase
		.from("groups")
		.select(
			`
    id,
    name,
    description,
    creator_id,
    group_members ( user_id )
  `,
		)
		.eq("id", groupId)
		.single();

	if (groupError) {
		console.error("Error fetching group:", groupError);
		// Ensure correct template literal
		throw new Error(`Failed to fetch group with ID ${groupId}`); // Corrected template literal
	}

	// 2. Parallelize fetching members, expense count, and detailed expenses
	const [membersResult, expenseCountResult, expensesResult] = await Promise.all(
		[
			// Fetch members + profiles
			supabase
				.from("group_members")
				.select(
					`
        user_id,
        profiles ( id, full_name )
      `,
				)
				.eq("group_id", groupId),
			// Fetch expense count
			supabase
				.from("expenses")
				.select("*", { count: "exact", head: true })
				.eq("group_id", groupId),
			// Fetch detailed expenses + payer profiles
			supabase
				.from("expenses")
				.select(
					`
        id,
        description,
        amount,
        created_at,
        payer_id,
        profiles ( id, full_name ) 
      `,
				)
				.eq("group_id", groupId)
				.order("created_at", { ascending: false }),
		],
	);

	// Handle potential errors from parallel fetches
	if (membersResult.error) {
		console.error("Error fetching members:", membersResult.error);
		throw new Error(`Failed to fetch members for group ${groupId}`);
	}
	if (expenseCountResult.error) {
		console.error("Error fetching expense count:", expenseCountResult.error);
		throw new Error(`Failed to fetch expense count for group ${groupId}`);
	}
	if (expensesResult.error) {
		console.error("Error fetching expenses:", expensesResult.error);
		throw new Error(`Failed to fetch expenses for group ${groupId}`);
	}

	// Extract data from results
	const membersData = membersResult.data;
	const expenseCount = expenseCountResult.count;
	const expensesData = expensesResult.data;

	// *** Authorization Check *** (using fetched membersData)
	const isUserMember = membersData.some((member) => member.user_id === userId);
	if (!isUserMember) {
		console.error(
			// Ensure correct template literal
			`Authorization Error: User ${userId} is not a member of group ${groupId}`, // Corrected template literal
		);
		throw new Error("User is not a member of this group.");
	}

	// Format members
	const members = membersData.map((member) => ({
		id: String(member.profiles.id),
		name: member.profiles.full_name,
		initials: member.profiles.full_name
			.split(" ")
			.map((word) => word[0])
			.join("")
			.toUpperCase(),
	}));

	// Sort members (using groupData.creator_id from initial fetch)
	members.sort((a, b) => {
		if (a.id === groupData.creator_id) return -1;
		if (b.id === groupData.creator_id) return 1;
		return a.name.localeCompare(b.name);
	});

	// 3. Fetch participants (conditionally, depends on expensesData)
	const expenseIds = expensesData.map((exp) => exp.id);
	let allParticipantsData: {
		expense_id: string;
		user_id: string;
		share_amount: number;
		is_settled: boolean | null;
	}[] = [];
	let isGroupSettled = true;

	if (expenseIds.length > 0) {
		const { data: participantsData, error: participantsError } = await supabase
			.from("expense_participants")
			.select("expense_id, user_id, share_amount, is_settled")
			.in("expense_id", expenseIds);

		if (participantsError) {
			console.error("Error fetching expense participants:", participantsError);
			throw new Error(
				`Failed to fetch expense participants for group ${groupId}`,
			);
		}
		allParticipantsData = participantsData;

		if (participantsData.some((p) => !p.is_settled)) {
			isGroupSettled = false;
		}
	} else {
		isGroupSettled = true;
	}

	// 4. Calculate Balances (using expensesData and allParticipantsData)
	let totalPaidByUser = 0;
	for (const exp of expensesData) {
		if (exp.payer_id === userId) {
			totalPaidByUser += exp.amount;
		}
	}

	let totalShareForUser = 0;
	for (const part of allParticipantsData) {
		if (part.user_id === userId) {
			totalShareForUser += part.share_amount;
		}
	}

	const balance = totalPaidByUser - totalShareForUser;
	const youOwe = balance < 0;

	// 5. Format Recent Expenses (using expensesData)
	const recentExpenses = expensesData.map((exp) => ({
		id: exp.id,
		description: exp.description,
		amount: exp.amount,
		created_at: exp.created_at,
		payer: {
			id: exp.profiles?.id ?? exp.payer_id,
			name: exp.profiles?.full_name ?? "Unknown User",
		},
	}));

	// 6. Assemble final Group object
	const group: Group = {
		id: groupData.id,
		name: groupData.name,
		description: groupData.description ?? "",
		creator_id: groupData.creator_id,
		members, // Now sorted with creator first
		expenses: expenseCount ?? 0,
		balance: Math.abs(balance),
		youOwe: youOwe,
		settled: isGroupSettled,
		recentExpenses: recentExpenses, // Add the formatted recent expenses
	};

	return group;
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
