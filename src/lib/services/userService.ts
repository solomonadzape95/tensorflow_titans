import type { CreateGroupFormData } from "../schema";
import supabase from "../supabase";

export async function getGroupsForUser(userId: string) {
	// 1. Fetch groups with member and expense counts using the efficient RPC
	const { data: groupsData, error: groupsError } = await supabase.rpc(
		"get_user_groups_with_counts",
		{
			p_user_id: userId,
		},
	);

	if (groupsError) {
		console.error("Error fetching groups with counts:", groupsError);
		throw groupsError;
	}

	if (!groupsData || groupsData.length === 0) {
		return [];
	}

	const groupIds = groupsData.map((g) => g.id);

	// 2. Fetch all expenses where the user is the payer in these groups
	const { data: paidExpenses, error: paidError } = await supabase
		.from("expenses")
		.select("group_id, amount")
		.in("group_id", groupIds)
		.eq("payer_id", userId);

	if (paidError) {
		console.error("Error fetching paid expenses:", paidError);
		// Continue, balances will be inaccurate
	}

	// 3. Fetch all expenses the user participated in within these groups, including expense details
	//    and the count of participants for each expense to calculate the share.
	const { data: participatedExpensesData, error: participatedError } =
		await supabase
			.from("expense_participants")
			.select(
				`
        user_id,
        expense:expenses!inner (
          id,
          group_id,
          amount,
          participant_count:expense_participants!inner(count)
        )
      `,
			)
			.eq("user_id", userId)
			.in("expense.group_id", groupIds); // Filter expenses by the user's groups

	if (participatedError) {
		console.error("Error fetching participated expenses:", participatedError);
		// Continue, balances will be inaccurate
	}

	// 4. Calculate balances in memory
	const groupBalances = new Map<string, { paid: number; share: number }>();

	// Initialize balances for all groups
	for (const groupId of groupIds) {
		groupBalances.set(groupId, { paid: 0, share: 0 });
	}

	// Aggregate amounts paid by the user
	if (paidExpenses) {
		for (const expense of paidExpenses) {
			const balance = groupBalances.get(expense.group_id);
			if (balance) {
				balance.paid += expense.amount;
			}
		}
	}

	// Aggregate user's share of participated expenses
	if (participatedExpensesData) {
		for (const participation of participatedExpensesData) {
			// Ensure expense and participant_count are valid
			const expense = participation.expense;
			if (!expense || !expense.group_id || typeof expense.amount !== "number") {
				continue; // Skip if data is incomplete
			}

			// Access the count correctly - it's an array with one object { count: number }
			const participantCount =
				Array.isArray(expense.participant_count) &&
				expense.participant_count.length > 0
					? (expense.participant_count[0]?.count ?? 1) // Default to 1 if count is missing/invalid
					: 1; // Default to 1 if structure is unexpected

			const userShare = expense.amount / Math.max(1, participantCount); // Avoid division by zero

			const balance = groupBalances.get(expense.group_id);
			if (balance) {
				balance.share += userShare;
			}
		}
	}

	// 5. Merge group data with calculated balances
	return groupsData.map((group) => {
		const balances = groupBalances.get(group.id) || { paid: 0, share: 0 };
		const netAmount = balances.paid - balances.share;
		return {
			id: group.id,
			name: group.name,
			description: group.description || "",
			expenseCount: group.expense_count || 0,
			balance: {
				amount: Math.abs(netAmount),
				isOwed: netAmount < 0, // True if user owes (share > paid)
			},
			memberCount: group.member_count || 0,
			members: [], // Member details are not fetched here
		};
	});
}
export async function getMembersOfMyCreatedGroups(currentUserId: string) {
	const { data, error } = await supabase
		.from("group_members")
		.select(
			`
        user_id,
        profiles ( id, full_name, email, avatar_url ),
        groups!inner ( creator_id )
      `,
		)
		.eq("groups.creator_id", currentUserId)
		.neq("user_id", currentUserId)
		.limit(15);

	if (error) {
		throw error;
	}

	const memberProfiles = data
		?.map((item) => item.profiles)
		.filter((profile) => profile !== null);

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
		.neq("id", userId)
		.single();

	// PGRST116: "Searched for a single row, but found 0 rows" - this is expected if user not found
	// We return null in this case, so we only throw other errors.
	if (error && error.code !== "PGRST116") {
		console.error("Error finding user by email:", error);
		throw error;
	}

	return data;
}

export async function getAllFriendsForUser(userId: string) {
	const { data: groupMemberships, error: groupError } = await supabase
		.from("group_members")
		.select("group_id")
		.eq("user_id", userId);

	if (groupError) {
		console.error("Error fetching user groups:", groupError);

		return { count: 0, profiles: [], error: groupError };
	}
	if (!groupMemberships || groupMemberships.length === 0) {
		return { count: 0, profiles: [], error: null };
	}

	const groupIds = groupMemberships.map((gm) => gm.group_id);

	const { data: allMembers, error: membersError } = await supabase
		.from("group_members")
		.select("user_id")
		.in("group_id", groupIds)
		.neq("user_id", userId);

	if (membersError) {
		console.error("Error fetching group members:", membersError);
		return { count: 0, profiles: [], error: membersError };
	}

	const uniqueFriendIds = [...new Set(allMembers?.map((m) => m.user_id) || [])];

	if (uniqueFriendIds.length === 0) {
		return { count: 0, profiles: [], error: null };
	}

	const { data: friendProfiles, error: profilesError } = await supabase
		.from("profiles")
		.select("id, full_name, avatar_url")
		.in("id", uniqueFriendIds)
		.limit(10);

	if (profilesError) {
		console.error("Error fetching friend profiles:", profilesError);
		return {
			count: uniqueFriendIds.length,
			profiles: [],
			error: profilesError,
		};
	}

	return {
		count: uniqueFriendIds.length,
		profiles: friendProfiles || [],
		error: null,
	};
}

export async function createGroup(
	data: CreateGroupFormData,
	creatorId: string,
) {
	console.log(creatorId);

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

export async function getDashboardCardData(userId: string) {
	const now = new Date();
	const startOfMonth = new Date(
		now.getFullYear(),
		now.getMonth(),
		1,
	).toISOString();
	const endOfMonth = new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0,
	).toISOString();
	const startOfPrevMonth = new Date(
		now.getFullYear(),
		now.getMonth() - 1,
		1,
	).toISOString();
	const endOfPrevMonth = new Date(
		now.getFullYear(),
		now.getMonth(),
		0,
	).toISOString();

	try {
		const [
			balanceResult,
			groupCountResult,
			friendResult,
			currentMonthExpensesResult,
			prevMonthExpensesResult,
		] = await Promise.all([
			supabase.rpc("get_user_balances", { current_user_id: userId }),
			supabase
				.from("group_members")
				.select("*", { count: "exact", head: true })
				.eq("user_id", userId),
			getAllFriendsForUser(userId),
			supabase
				.from("expenses")
				.select("amount")
				.eq("payer_id", userId)
				.gte("expense_date", startOfMonth)
				.lte("expense_date", endOfMonth),
			supabase
				.from("expenses")
				.select("amount")
				.eq("payer_id", userId)
				.gte("expense_date", startOfPrevMonth)
				.lte("expense_date", endOfPrevMonth),
		]);

		if (balanceResult.error) throw balanceResult.error;
		const balanceDetails = balanceResult.data || [];
		let total_owed_to_user = 0;
		let total_user_owes = 0;
		for (const balance of balanceDetails) {
			const netAmount = balance.net_amount ?? 0;
			if (netAmount > 0) {
				total_owed_to_user += netAmount;
			} else {
				total_user_owes += Math.abs(netAmount);
			}
		}
		const total_balance = total_owed_to_user - total_user_owes;

		if (groupCountResult.error) throw groupCountResult.error;
		const groupCount = groupCountResult.count ?? 0;

		if (friendResult.error) throw friendResult.error;
		const { count: friendCount, profiles: friendProfiles } = friendResult;

		if (currentMonthExpensesResult.error)
			throw currentMonthExpensesResult.error;
		const currentMonthTotal = (currentMonthExpensesResult.data || []).reduce(
			(sum, expense) => sum + expense.amount,
			0,
		);

		if (prevMonthExpensesResult.error) throw prevMonthExpensesResult.error;
		const prevMonthTotal = (prevMonthExpensesResult.data || []).reduce(
			(sum, expense) => sum + expense.amount,
			0,
		);

		const percentageChange =
			prevMonthTotal === 0
				? currentMonthTotal > 0
					? 100
					: 0
				: ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;

		return {
			balances: {
				total_balance,
				total_owed_to_user,
				total_user_owes,
			},
			groups: {
				count: groupCount,
			},
			friends: {
				count: friendCount,
				profiles: friendProfiles,
			},
			spending: {
				currentMonthTotal,
				percentageChange,
			},
		};
	} catch (error) {
		console.error("Error fetching dashboard card data:", error);

		throw error;
	}
}

export async function getRecentActivities(userId: string, limit = 5) {
	const { data: participationData, error: participationError } = await supabase
		.from("expense_participants")
		.select("expense_id")
		.eq("user_id", userId);

	if (participationError) {
		console.error("Error fetching expense participations:", participationError);
		throw participationError;
	}

	const participatedExpenseIds =
		participationData?.map((p) => p.expense_id) || [];

	let orFilter = `payer_id.eq.${userId}`;
	if (participatedExpenseIds.length > 0) {
		orFilter += `,id.in.(${participatedExpenseIds.join(",")})`;
	}

	const { data, error } = await supabase
		.from("expenses")
		.select(`
      id,
      description,
       amount,
       expense_date,
       payer:profiles!payer_id ( full_name, avatar_url )
     `)
		.or(orFilter)
		.order("expense_date", { ascending: false })
		.limit(limit);

	if (error) {
		console.error("Error fetching recent activities:", error);
		throw error;
	}

	return data || [];
}

export async function joinGroup(userId: string, groupId: string): Promise<void> {
  // Check if the user is already a member of the group
  const { data: existingMembership, error: membershipError } = await supabase
    .from("group_members")
    .select("joined_at")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .single();

  if (membershipError && membershipError.code !== "PGRST116") {
    console.error("Error checking group membership:", membershipError);
    throw new Error("Failed to check group membership.");
  }

  if (existingMembership) {
    throw new Error("You are already a member of this group.");
  }

  //Add the user to the group
  const { error: insertError } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      user_id: userId,
    });

  if (insertError) {
    console.error("Error adding user to group:", insertError);
    throw new Error("Failed to join the group.");
  }
}
