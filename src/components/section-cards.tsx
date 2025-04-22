import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { protectPage } from "@/lib/services/authService";
import { getDashboardCardData } from "@/lib/services/userService";
import { formatNaira } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";
import { Button } from "./ui/button";

export function SectionCards() {
	const loaderData = useLoaderData() as Awaited<ReturnType<typeof protectPage>>;

	const { data } = useSuspenseQuery({
		queryKey: ["user", "stats", loaderData.user.id],
		queryFn: async () => await getDashboardCardData(loaderData.user.id),
	});

	// Destructure for easier access
	const { balances, groups, friends, spending } = data;

	// Calculate friends to show vs remaining count
	const maxAvatarsToShow = 5;
	const avatarsToShow = friends.profiles.slice(0, maxAvatarsToShow);
	const remainingFriendsCount = Math.max(0, friends.count - maxAvatarsToShow);

	// Format spending percentage change
	const spendingChangeText =
		spending.percentageChange >= 0
			? `${spending.percentageChange.toFixed(0)}% more`
			: `${Math.abs(spending.percentageChange).toFixed(0)}% less`;
	const spendingChangeColor =
		spending.percentageChange >= 0
			? "text-[var(--destructive)]"
			: "text-[var(--chart-2)]"; // Adjust colors as needed

	return (
		<div className=" flex flex-col lg:flex-row w-full gap-4 px-4 *:data-[slot=card]:bg-gradi *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			<Card className="bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md rounded-xl shadow-xl @container/card flex-grow">
				<CardHeader className="">
					<CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-xl">
						Total Balance
					</CardTitle>
					<CardDescription className="text-[25px] font-semibold text-[#4F32FF]">
						{formatNaira(balances.total_balance)}
					</CardDescription>
					<CardDescription className=" justify-center text-sm pt-0">
						<div className=" font-medium">
							You are owed{" "}
							<span className="text-[var(--chart-2)] font-semibold">
								{formatNaira(balances.total_owed_to_user)}
							</span>{" "}
							and you owe{" "}
							<span className="text-[var(--destructive)]">
								{formatNaira(balances.total_user_owes)}
							</span>
						</div>
					</CardDescription>
				</CardHeader>
				<Button className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white shadow-md font-semibold text-xs mt-4 hover:bg-transparent w-10/12 mx-auto">
					View Details
				</Button>
			</Card>

			<Card className="bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md rounded-xl shadow-xl @container/card flex-grow">
				<CardHeader className="">
					<CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-xl">
						Active groups
					</CardTitle>
					<CardDescription className="text-[25px] font-semibold text-[#4F32FF]">
						{groups.count}
					</CardDescription>
					<CardDescription className=" justify-center text-sm pt-0">
						<div className=" font-medium">Across {friends.count} friends</div>
					</CardDescription>
				</CardHeader>
				<div className="mt-4 flex -space-x-2 w-10/12 mr-auto ml-4">
					{avatarsToShow.map((profile, i) => (
						<Avatar
							key={profile.id}
							className="border-2 border-gray-800 dark:border-background animate-float"
							style={{ animationDelay: `${i * 0.1}s` }}
						>
							<AvatarImage
								src={
									profile.avatar_url ||
									`/placeholder.svg?text=${profile.full_name?.[0] || "?"}`
								}
								alt={profile.full_name || "Friend"}
							/>
							<AvatarFallback>{profile.full_name?.[0] || "?"}</AvatarFallback>
						</Avatar>
					))}
					{remainingFriendsCount > 0 && (
						<div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gary-800 dark:border-background bg-muted text-xs font-medium animate-float">
							+{remainingFriendsCount}
						</div>
					)}
				</div>
			</Card>

			<Card className="bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md rounded-xl shadow-2xl @container/card flex-grow">
				<CardHeader className="">
					<CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-xl">
						Monthly Spending
					</CardTitle>
					<CardDescription className="text-[25px] font-semibold text-[#4F32FF]">
						{formatNaira(spending.currentMonthTotal)}
					</CardDescription>
					<CardDescription className="w-10/12 justify-center text-sm pt-0">
						<div className=" font-medium">
							<span className={spendingChangeColor}>{spendingChangeText} </span>
							from last month
						</div>
					</CardDescription>
				</CardHeader>
				{/* Budget progress bar removed as requested */}
			</Card>
		</div>
	);
}
