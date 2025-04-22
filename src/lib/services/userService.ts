import type { GroupData } from "@/types";
import type { CreateGroupFormData } from "../schema";
import supabase from "../supabase";
export async function getGroupsForUser(userId: string) {
	const { data, error } = await supabase
		.from("group_members")
		.select(
			`
    group_id,
    groups ( id, name, description, creator_id )
    `,
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
				countError || expenseError,
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
