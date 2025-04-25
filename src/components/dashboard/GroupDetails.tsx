import type { protectPage } from "@/lib/services/authService";
import { getGroupById } from "@/lib/services/groups/groupService";
import { formatNaira } from "@/lib/utils";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Receipt, Users } from "lucide-react";
import {
	Link,
	Outlet,
	useLoaderData,
	useLocation,
	useParams,
} from "react-router";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

function GroupDetails() {
	const { id } = useParams<{ id: string }>();
	const loaderData = useLoaderData() as Awaited<ReturnType<typeof protectPage>>;
	const location = useLocation();
	const pathname = location.pathname;
	const creatingExpense = pathname.includes("expenses/new");
	const { data: group, isLoading } = useQuery({
		queryKey: ["group", id],
		queryFn: async () => {
			if (!id) return null;

			const groupData = await getGroupById(id, loaderData.user.id);
			return groupData;
		},
		enabled: !!id,
	});
	console.log(group);

	if (!id) return <NotFound />;

	return (
		<>
			{isLoading || !group ? (
				<div>Loading Group....</div>
			) : creatingExpense ? (
				<Outlet />
			) : (
				<>
					<Breadcrumb className="px-6 mb-6">
						<BreadcrumbItem>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbLink href="/dashboard/groups">
										Groups
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator />
								<BreadcrumbItem>
									<BreadcrumbPage>
										Group Details for {group.name.toUpperCase()}
									</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</BreadcrumbItem>
					</Breadcrumb>
					<div className="space-y-8 px-4 md:px-8">
						<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
							<div className="flex items-center gap-2">
								<div>
									<h1 className="text-3xl font-bold tracking-tight font-display">
										<span className="text-gradient">{group.name}</span>
									</h1>
									<p className="text-muted-foreground">{group.description}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button
									asChild
									className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 group"
								>
									<Link to="/dashboard/expenses/new">
										<Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
										Add Expense
									</Link>
								</Button>
							</div>
						</div>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							<Card className="hover:shadow-glow transition-all duration-300 ">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">
										Group Balance
									</CardTitle>
								</CardHeader>
								<CardContent className="m-0">
									{group.settled ? (
										<div className="text-2xl font-bold text-green-500 font-display">
											All settled up
										</div>
									) : group.youOwe ? (
										<div className="text-2xl font-bold text-red-500 font-display">
											You owe {formatNaira(group.balance)}
										</div>
									) : (
										<div className="text-2xl font-bold text-green-500 font-display">
											You're owed {formatNaira(group.balance)}
										</div>
									)}
								</CardContent>
							</Card>
							<Card className="hover:shadow-glow transition-all duration-300">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">
										Expenses
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-2">
										<Receipt className="h-5 w-5 text-primary" />
										<div className="text-2xl font-bold font-display">
											{group.expenses}
										</div>
									</div>
								</CardContent>
							</Card>
							<Card className="hover:shadow-glow transition-all duration-300">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium">Members</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-2">
										<Users className="h-5 w-5 text-primary" />
										<div className="text-2xl font-bold font-display">
											{group.members.length}
										</div>
									</div>
									<div className="mt-2 flex -space-x-2">
										{group.members.slice(0, 5).map((member) => (
											<Avatar
												key={member.id}
												className="border-2 border-background"
											>
												<AvatarFallback>{member.initials}</AvatarFallback>
											</Avatar>
										))}
										{group.members.length > 5 && (
											<div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
												+{group.members.length - 5}
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>

						<Tabs defaultValue="activity" className="space-y-4">
							<TabsList className="glass">
								<TabsTrigger
									value="activity"
									className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
								>
									Recent Activity
								</TabsTrigger>
								<TabsTrigger
									value="balances"
									className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
								>
									Balances
								</TabsTrigger>
								<TabsTrigger
									value="members"
									className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
								>
									Members
								</TabsTrigger>
							</TabsList>
							<TabsContent value="activity" className="space-y-4">
								<Card>
									<CardHeader>
										<CardTitle>Recent Activity</CardTitle>
										<CardDescription>
											Recent transactions in this group Recent transactions in
											this group
										</CardDescription>
									</CardHeader>
									<CardContent>
										{group.recentExpenses && group.recentExpenses.length > 0 ? (
											<div className="space-y-4">
												{group.recentExpenses.map((exp) => (
													<div
														key={exp.id}
														className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
													>
														<div className="flex flex-col">
															<span className="font-medium">
																{exp.description || "Expense"}
															</span>
															<span className="text-sm text-muted-foreground">
																Paid by {exp.payer.name ?? "Unknown"} on{" "}
																{exp.created_at
																	? format(new Date(exp.created_at), "PP")
																	: "N/A"}
															</span>
														</div>
														<div className="font-medium">
															{formatNaira(exp.amount)}
														</div>
													</div>
												))}
											</div>
										) : (
											<p className="text-center py-8 text-muted-foreground">
												No recent activity in this group
											</p>
										)}
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="balances" className="space-y-4">
								<Card>
									<CardHeader>
										<CardTitle>Group Balances</CardTitle>
										<CardDescription>
											Who owes who in this group
										</CardDescription>
									</CardHeader>
									<CardContent>
										{group.detailedBalances &&
										group.detailedBalances.length > 0 ? (
											<div className="space-y-4">
												{group.detailedBalances.map((balance, i) => (
													<div
														key={`${balance.debtorId}-${balance.creditorId}-${i}`}
														className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
													>
														<div className="flex items-center gap-3">
															{/* Consider adding avatars here if available */}
															<span className="capitalize font-medium">
																{balance.debtorName.toLowerCase()}
															</span>
															<span className="text-muted-foreground">
																owes
															</span>
															<span className="capitalize font-medium">
																{balance.creditorName.toLowerCase()}
															</span>
														</div>
														<div className="font-medium text-red-500">
															{formatNaira(balance.amount)}
														</div>
													</div>
												))}
											</div>
										) : (
											<p className="text-center py-8 text-muted-foreground">
												No outstanding balances in this group. All settled up!
											</p>
										)}
									</CardContent>
								</Card>
							</TabsContent>
							<TabsContent value="members" className="space-y-4">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between">
										<div>
											<CardTitle>Group Members</CardTitle>
											<CardDescription>People in this group</CardDescription>
										</div>
										<Button size="sm" className="group">
											<Plus className="mr-2 h-4 w-4" />
											Invite
										</Button>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{group.members.map((member) => (
												<div
													key={member.id}
													className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
												>
													<div className="flex items-center gap-3">
														<Avatar className="w-10 h-10">
															<AvatarFallback>{member.initials}</AvatarFallback>
														</Avatar>
														<div>
															<div className="font-medium capitalize">
																{member.name.toLowerCase()}
															</div>
														</div>
													</div>
													{member.id === group.creator_id && (
														<div className="text-sm font-medium text-primary">
															{group.creator_id === loaderData.user.id
																? "You (Admin)"
																: "Admin"}
														</div>
													)}
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
				</>
			)}
		</>
	);
}

export default GroupDetails;
