import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type CreateGroupFormData, createGroupSchema } from "@/lib/schema";
import type { protectPage } from "@/lib/services/authService";
import { getMembersOfMyCreatedGroups } from "@/lib/services/userService";
import { getInitials } from "@/lib/utils";
import type { Tables } from "@/types/database.types"; // Import Tables type
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"; // Import useQueryClient
import { Check, Link, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLoaderData } from "react-router";
import InviteToGroup from "./InviteToGroup";

type FormValues = CreateGroupFormData;
type MemberProfile = Omit<Tables<"profiles">, "created_at" | "updated_at">;

const CreateGroup = () => {
	const [isOpen, setIsOpen] = useState(false);
	const loaderData = useLoaderData() as Awaited<ReturnType<typeof protectPage>>;
	const queryClient = useQueryClient();

	const { data: fetchedMembersData } = useSuspenseQuery<MemberProfile[]>({
		queryKey: ["members"],
		queryFn: async () => {
			return await getMembersOfMyCreatedGroups(loaderData.user.id);
		},
	});

	const form = useForm<FormValues>({
		resolver: zodResolver(createGroupSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			description: "",
			selectedMembers: [],
		},
	});

	const watchedSelectedMembers = form.watch("selectedMembers");

	const displayMembers = useMemo(() => {
		const selectedIds = new Set(watchedSelectedMembers);
		return fetchedMembersData
			.filter((profile) => !!profile.email)
			.map((profile) => ({
				...profile,
				selected: selectedIds.has(profile.id),
			}));
	}, [fetchedMembersData, watchedSelectedMembers]);

	const toggleMemberSelection = (id: string) => {
		const currentSelected = form.getValues("selectedMembers");
		const newSelected = currentSelected.includes(id)
			? currentSelected.filter((memberId) => memberId !== id)
			: [...currentSelected, id];
		form.setValue("selectedMembers", newSelected, { shouldValidate: true });
	};

	const onSubmit = (data: FormValues) => {
		console.log("Form data:", data);
		console.log("Selected Member IDs:", data.selectedMembers);
		// TODO: Implement actual group creation logic using data.selectedMembers
	};

	// Callback function to handle newly invited user using queryClient
	const handleUserInvited = (newUser: MemberProfile) => {
		// Update the cache
		queryClient.setQueryData<MemberProfile[]>(["members"], (oldData) => {
			if (!oldData) return [newUser];
			// Add the new user only if they aren't already in the cache
			if (!oldData.some((member) => member.id === newUser.id)) {
				return [...oldData, newUser];
			}
			return oldData;
		});

		// Automatically select the newly invited member in the form
		const currentSelected = form.getValues("selectedMembers");
		if (!currentSelected.includes(newUser.id)) {
			form.setValue("selectedMembers", [...currentSelected, newUser.id], {
				shouldValidate: true,
			});
		}
		// Close the dialog
		setIsOpen(false);
	};

	return (
		<div className="max-w-2xl mx-auto space-y-6 py-10 flex-1 overflow-y-auto px-4 md:px-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Create a New Group
				</h1>
				<p className="text-muted-foreground">
					Create a group to start splitting expenses with friends.
				</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<Card>
						<CardContent className="space-y-6 pt-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Group Name</FormLabel>
										<FormControl>
											<Input placeholder="Enter group name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description (Optional)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="What's this group for?"
												className="bg-background min-h-20"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="space-y-4">
								<div className="flex flex-col md:flex-row md:items-center justify-between">
									<label className="text-sm font-medium">Add Members</label>
									<div className="flex gap-2 mt-2 md:mt-0">
										<Button
											type="button"
											variant="outline"
											onClick={() => setIsOpen(true)}
										>
											<Plus className="w-4 h-4 mr-2" />
											Invite New
										</Button>
										<Button
											variant="outline"
											className="cursor-pointer"
											type="button"
										>
											<Link className="w-4 h-4 mr-2" />
											Copy Link
										</Button>
									</div>
								</div>

								{/* Hidden FormField to register 'selectedMembers' with react-hook-form */}
								{/* This ensures the field is part of the form state even if not directly rendered */}
								<FormField
									control={form.control}
									name="selectedMembers"
									render={({ field }) => (
										<FormItem className="hidden" aria-hidden={true}>
											<FormControl>
												<input type="hidden" {...field} />
											</FormControl>
											<FormMessage />
											{/* Still show validation messages if needed */}
										</FormItem>
									)}
								/>

								<div className="space-y-2">
									{displayMembers.map((member) => (
										<div
											key={member.id}
											className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer hover:bg-background/50 ${
												member.selected ? "bg-[#4F32FF]/5 border-[#4F32FF]" : ""
											}`}
											onClick={() => toggleMemberSelection(member.id)}
										>
											<div className="flex items-center gap-3">
												<Avatar>
													<AvatarImage
														src={member.avatar_url ?? undefined}
														alt={member.full_name}
													/>
													<AvatarFallback>
														{getInitials(member.full_name)}
													</AvatarFallback>
												</Avatar>
												<div>
													<p className="font-medium capitalize">
														{member.full_name.toLowerCase()}
													</p>
													<p className="text-sm text-muted-foreground lowercase">
														{member.email.toLowerCase()}
													</p>
												</div>
											</div>
											<div
												className={`w-6 h-6 rounded-full flex items-center justify-center border ${
													member.selected ? "bg-[#4F32FF] border-[#4F32FF]" : ""
												}`}
											>
												{member.selected && (
													<Check className="w-4 h-4 text-white" />
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						</CardContent>

						<div className="flex justify-between px-6 pb-6 pt-0">
							<Button
								variant="outline"
								className="cursor-pointer h-10 px-4 py-4"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 cursor-pointer"
								disabled={
									!form.formState.isValid || form.formState.isSubmitting
								}
							>
								{form.formState.isSubmitting ? "Creating..." : "Create Group"}
							</Button>
						</div>
					</Card>
				</form>
			</Form>
			<InviteToGroup
				isOpen={isOpen}
				onOpenChange={setIsOpen}
				userId={loaderData.user.id}
				onUserInvited={handleUserInvited} // Pass the callback
			/>
		</div>
	);
};

export default CreateGroup;
