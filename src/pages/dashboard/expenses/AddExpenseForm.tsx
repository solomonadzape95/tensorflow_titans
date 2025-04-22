import { useState, useEffect } from "react";
import { useNavigate, useLoaderData } from "react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
// import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
	CalendarIcon,
	Car,
	DollarSign,
	Film,
	Home,
	Plane,
	Receipt,
	ShoppingBag,
	Utensils,
	Wifi,
} from "lucide-react";

import { getInitials } from "@/lib/utils";
import { getMembersOfMyGroups, getMyGroups, createExpense } from "@/lib/services/userService";
import { createExpenseSchema, type CreateExpenseFormData } from "@/lib/schema";
import type { Tables } from "@/types/database.types";
import type { protectPage } from "@/lib/services/authService";

const categories = [
	{ id: "food", name: "Food & Drink", icon: Utensils },
	{ id: "groceries", name: "Groceries", icon: ShoppingBag },
	{ id: "housing", name: "Housing", icon: Home },
	{ id: "transportation", name: "Transportation", icon: Car },
	{ id: "travel", name: "Travel", icon: Plane },
	{ id: "entertainment", name: "Entertainment", icon: Film },
	{ id: "utilities", name: "Utilities", icon: Wifi },
	{ id: "other", name: "Other", icon: Receipt },
];

type MemberProfile = Omit<Tables<"profiles">, "created_at" | "updated_at">;
type Group = Tables<"groups">;

export function AddExpenseForm() {
	const navigate = useNavigate();
	const loaderData = useLoaderData() as Awaited<ReturnType<typeof protectPage>>;
	const [paidByUser, setPaidByUser] = useState("you-paid");
	const queryClient = useQueryClient();

	const form = useForm<CreateExpenseFormData>({
		resolver: zodResolver(createExpenseSchema),
		defaultValues: {
			description: "",
			amount: 0,
			date: new Date().toISOString().split("T")[0],
			groupId: "",
			category: "food",
			notes: "",
			splitMethod: "equal",
			splits: {},
		},
		mode: "onChange",
	});

	const { groupId, splitMethod } = form.watch();

	const { data: groups } = useSuspenseQuery<Group[]>({
		queryKey: ["userGroups"],
		queryFn: async () => {
			const data = await getMyGroups(loaderData.user.id);
			return data.map(item => ({
				...item,
				updated_at: null 
			}));
		},
		staleTime: Number.POSITIVE_INFINITY,
	});

	// Fetch members based on selected group
	const { data: groupMembers } = useSuspenseQuery<MemberProfile[]>({
		queryKey: ["groupMembers", groupId],
		queryFn: async () => {
			if (!groupId) return [];
			return await getMembersOfMyGroups(loaderData.user.id, groupId);
		},
		staleTime: Number.POSITIVE_INFINITY,
	});

	const { mutate: submitExpense, isPending: isSubmitting } = useMutation({
		mutationFn: async (data: CreateExpenseFormData) => {
			return await createExpense(data, loaderData.user.id);
		},
		onSuccess: () => {
			toast.success("Expense saved successfully!");
			navigate("/dashboard");

			queryClient.invalidateQueries({ queryKey: ["expenses"] });
			queryClient.invalidateQueries({ queryKey: ["balances"] });
		},
		onError: (error) => {
			toast.error(`Failed to save expense: ${error.message}`);
		},
	});

	useEffect(() => {
		if (Array.isArray(groupMembers) && groupMembers.length > 0 && splitMethod) {
			const newSplits: Record<string, number> = {};
			const allMembers = [
				...(Array.isArray(groupMembers) ? groupMembers : []),
				// Add current user if not already in the list
				...(Array.isArray(groupMembers) && !groupMembers.some(m => m.id === loaderData.user.id)
					? [{ id: loaderData.user.id, full_name: "You" }] as MemberProfile[]
					: [])
			];

			if (splitMethod === "equal") {
				const equalShare = 100 / allMembers.length;
				allMembers.forEach(member => {
					newSplits[member.id] = equalShare;
				});
			} else {
				allMembers.forEach(member => {
					newSplits[member.id] = 0;
				});
				newSplits[loaderData.user.id] = 100;
			}

			form.setValue("splits", newSplits);
		}
	}, [groupMembers, splitMethod, form, loaderData.user.id]);

	const handleSplitMethodChange = (value: string) => {
		form.setValue("splitMethod", value as "equal" | "custom" | "percentage");
	};

	const handlePaidByChange = (value: string) => {
		setPaidByUser(value);
		if (value === "you-paid") {
			form.setValue("paidBy", loaderData.user.id);
		} else {
			form.setValue("paidBy", "");
		}
	};

	const onSubmit = (data: CreateExpenseFormData) => {
		const formattedData = {
			...data,
			amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount
		};

		submitExpense(formattedData);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="animate-in">
				<Card className="hover:shadow-glow transition-all duration-300">
					<CardHeader>
						<CardTitle className="font-display">Expense Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="space-y-2 animate-in">
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input
											placeholder="What was this expense for?"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem className="space-y-2 animate-in animate-in-delay-1">
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<div className="relative">
											<DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												type="number"
												step="0.01"
												min="0.01"
												placeholder="0.00"
												className="pl-10"
												onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
												value={field.value}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="space-y-2 animate-in animate-in-delay-2">
									<FormLabel>Date</FormLabel>
									<FormControl>
										<div className="relative">
											<CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												type="date"
												className="pl-10"
												{...field}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="groupId"
							render={({ field }) => (
								<FormItem className="space-y-2 animate-in animate-in-delay-3">
									<FormLabel>Group</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="glass">
												<SelectValue placeholder="Select a group" />
											</SelectTrigger>
										</FormControl>
										<SelectContent className="glass">
											<SelectItem value="select group" disabled>
												Select a group
											</SelectItem>
											{groups && groups.map((group: Group) => (
												<SelectItem key={group.id} value={group.id}>
													{group.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="category"
							render={({ field }) => (
								<FormItem className="space-y-2 animate-in animate-in-delay-3">
									<FormLabel>Category</FormLabel>
									<div className="grid grid-cols-4 gap-2">
										{categories.map((category) => {
											const Icon = category.icon;
											return (
												<div
													key={category.id}
													className={`flex cursor-pointer flex-col items-center justify-center rounded-lg glass transition-all duration-300 p-3 ${field.value === category.id
															? "border-primary bg-primary/10 shadow-glow"
															: "hover:bg-accent/20"
														}`}
													onClick={() => field.onChange(category.id)}
												>
													<Icon
														className={`mb-1 h-6 w-6 transition-all duration-300 ${field.value === category.id
																? "text-primary animate-bounce-subtle"
																: ""
															}`}
													/>
													<span className="text-xs">{category.name}</span>
												</div>
											);
										})}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						{groupId && groupMembers && groupMembers.length > 0 && (
							<div className="space-y-4">
								<FormLabel>Split Method</FormLabel>
								<Tabs
									value={splitMethod}
									onValueChange={handleSplitMethodChange}
									className="w-full"
								>
									<TabsList className="grid w-full grid-cols-3 glass">
										<TabsTrigger
											value="equal"
											className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
										>
											Equal
										</TabsTrigger>
										<TabsTrigger
											value="custom"
											className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
										>
											Custom
										</TabsTrigger>
										<TabsTrigger
											value="percentage"
											className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
										>
											Percentage
										</TabsTrigger>
									</TabsList>
									<TabsContent value="equal" className="mt-4 space-y-4 animate-in">
										<p className="text-sm text-muted-foreground">
											Split equally among all members
										</p>

										<RadioGroup
											value={paidByUser}
											onValueChange={handlePaidByChange}
											className="glass p-4 rounded-lg mb-4"
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="you-paid" id="you-paid" />
												<Label htmlFor="you-paid">
													You paid, split with everyone
												</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="someone-paid" id="someone-paid" />
												<Label htmlFor="someone-paid">Someone else paid</Label>
											</div>
										</RadioGroup>

										{paidByUser === "someone-paid" && (
											<FormField
												control={form.control}
												name="paidBy"
												render={({ field }) => (
													<FormItem className="mb-4">
														<FormLabel>Who paid?</FormLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<FormControl>
																<SelectTrigger className="glass">
																	<SelectValue placeholder="Select who paid" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{groupMembers.map((member) => (
																	<SelectItem key={member.id} value={member.id}>
																		{member.full_name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
										)}

										<div className="space-y-2">
											{/* Display current user first */}
											<div
												className="flex items-center justify-between rounded-lg glass p-3 hover:shadow-glow transition-all duration-300"
											>
												<div className="flex items-center gap-3">
													<Avatar className="animate-float">
														{/* <AvatarImage
															src={loaderData.user.avatar_url}
															alt="You"
														/> */}
														<AvatarFallback>You</AvatarFallback>
													</Avatar>
													<span>You</span>
												</div>
												<span className="font-medium text-gradient">
													{groupMembers.length > 0 ? Math.round(100 / (groupMembers.length + 1)) : 100}%
												</span>
											</div>

											{/* Then display other members */}
											{groupMembers.map((member) => (
												<div
													key={member.id}
													className="flex items-center justify-between rounded-lg glass p-3 hover:shadow-glow transition-all duration-300"
												>
													<div className="flex items-center gap-3">
														<Avatar className="animate-float">
															<AvatarImage
																src={member.avatar_url ?? undefined}
																alt={member.full_name}
															/>
															<AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
														</Avatar>
														<span className="capitalize">{member.full_name.toLowerCase()}</span>
													</div>
													<span className="font-medium text-gradient">
														{Math.round(100 / (groupMembers.length + 1))}%
													</span>
												</div>
											))}
										</div>
									</TabsContent>

									<TabsContent value="custom" className="mt-4 space-y-4 animate-in">
										<p className="text-sm text-muted-foreground">
											Enter custom amounts for each person
										</p>

										<RadioGroup
											value={paidByUser}
											onValueChange={handlePaidByChange}
											className="glass p-4 rounded-lg mb-4"
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="you-paid" id="you-paid-custom" />
												<Label htmlFor="you-paid-custom">
													You paid, split multiple ways
												</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="someone-paid" id="someone-paid-custom" />
												<Label htmlFor="someone-paid-custom">Someone else paid</Label>
											</div>
										</RadioGroup>

										{paidByUser === "someone-paid" && (
											<FormField
												control={form.control}
												name="paidBy"
												render={({ field }) => (
													<FormItem className="mb-4">
														<FormLabel>Who paid?</FormLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<FormControl>
																<SelectTrigger className="glass">
																	<SelectValue placeholder="Select who paid" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{groupMembers.map((member) => (
																	<SelectItem key={member.id} value={member.id}>
																		{member.full_name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
										)}

										<FormField
											control={form.control}
											name="splits"
											render={() => (
												<FormItem>
													<div className="space-y-2">
														{/* Current user first */}
														<div className="space-y-2 rounded-lg glass p-3 hover:shadow-glow transition-all duration-300">
															<div className="flex items-center justify-between">
																<div className="flex items-center gap-3">
																	<Avatar className="animate-float">
																		{/* <AvatarImage
																			src={loaderData.user.avatar_url}
																			alt="You"
																		/> */}
																		<AvatarFallback>You</AvatarFallback>
																	</Avatar>
																	<span>You</span>
																</div>
																<div className="relative">
																	<DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
																	<Input
																		placeholder="0.00"
																		className="w-24 pl-10"
																		type="number"
																		step="0.01"
																		min="0"
																		onChange={(e) => {
																			const newSplits = { ...form.getValues("splits") };
																			newSplits[loaderData.user.id] = parseFloat(e.target.value) || 0;
																			form.setValue("splits", newSplits);
																		}}
																		value={form.getValues("splits")[loaderData.user.id] || ""}
																	/>
																</div>
															</div>
														</div>

														{/* Other members */}
														{groupMembers.map((member) => (
															<div
																key={member.id}
																className="space-y-2 rounded-lg glass p-3 hover:shadow-glow transition-all duration-300"
															>
																<div className="flex items-center justify-between">
																	<div className="flex items-center gap-3">
																		<Avatar className="animate-float">
																			{/* <AvatarImage
																				src={member.avatar_url ?? undefined}
																				alt={member.full_name}
																			/> */}
																			<AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
																		</Avatar>
																		<span className="capitalize">{member.full_name.toLowerCase()}</span>
																	</div>
																	<div className="relative">
																		<DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
																		<Input
																			placeholder="0.00"
																			className="w-24 pl-10"
																			type="number"
																			step="0.01"
																			min="0"
																			onChange={(e) => {
																				const newSplits = { ...form.getValues("splits") };
																				newSplits[member.id] = parseFloat(e.target.value) || 0;
																				form.setValue("splits", newSplits);
																			}}
																			value={form.getValues("splits")[member.id] || ""}
																		/>
																	</div>
																</div>
															</div>
														))}
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>
									</TabsContent>

									<TabsContent value="percentage" className="mt-4 space-y-4 animate-in">
										<p className="text-sm text-muted-foreground">
											Adjust percentages for each person
										</p>

										<RadioGroup
											value={paidByUser}
											onValueChange={handlePaidByChange}
											className="glass p-4 rounded-lg mb-4"
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="you-paid" id="you-paid-percent" />
												<Label htmlFor="you-paid-percent">
													You paid, split by percentage
												</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="someone-paid" id="someone-paid-percent" />
												<Label htmlFor="someone-paid-percent">Someone else paid</Label>
											</div>
										</RadioGroup>

										{paidByUser === "someone-paid" && (
											<FormField
												control={form.control}
												name="paidBy"
												render={({ field }) => (
													<FormItem className="mb-4">
														<FormLabel>Who paid?</FormLabel>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<FormControl>
																<SelectTrigger className="glass">
																	<SelectValue placeholder="Select who paid" />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{groupMembers.map((member) => (
																	<SelectItem key={member.id} value={member.id}>
																		{member.full_name}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
										)}
									</TabsContent>
								</Tabs>
							</div>
						)}
						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem className="space-y-2 animate-in animate-in-delay-4">
									<FormLabel>Notes</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Any additional notes?"
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
					<CardFooter className="flex justify-end space-x-2 p-4">
						<Button type="button" onClick={() => navigate(-1)}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting} className="min-w-[120px]" variant="gradient">
							{isSubmitting ? (<div className="flex items-center gap-2">
								<svg
									className="animate-spin h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								<span>Saving...</span>
							</div>
						) : ("Save Expense")}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
