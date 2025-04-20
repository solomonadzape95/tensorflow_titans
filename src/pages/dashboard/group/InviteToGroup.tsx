import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type InviteToGroupFormData, inviteToGroupSchema } from "@/lib/schema";
import { findUserByEmail } from "@/lib/services/userService"; // Import Profile type
import { capitalizeWords } from "@/lib/utils";
import type { Tables } from "@/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type InviteToGroupProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	onUserInvited: (
		user: Omit<Tables<"profiles">, "created_at" | "updated_at">,
	) => void; // Add callback prop
};

const InviteToGroup = ({
	isOpen,
	onOpenChange,
	userId,
	onUserInvited, // Destructure new prop
}: InviteToGroupProps) => {
	const [copied, setCopied] = useState(false);
	const inviteLink = "https://splitwise.com/join/abc123";

	const form = useForm<InviteToGroupFormData>({
		resolver: zodResolver(inviteToGroupSchema),
		defaultValues: {
			email: "",
		},
	});

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(inviteLink);
			toast.success("Link copied to clipboard!");
			setCopied(true);
			setTimeout(() => setCopied(false), 3000);
		} catch (err) {
			console.error("Failed to copy link: ", err);
		}
	};

	const onSubmit = async (data: InviteToGroupFormData) => {
		const user = await findUserByEmail(data.email, userId);

		if (user === null) {
			toast.error("User not found. Please check the email address.");
			return;
		}

		toast.success(
			`Invitation sent to ${capitalizeWords(user.full_name)} (${user.email.toLowerCase()})!`,
		);

		// Call the callback with the invited user's data
		onUserInvited(user);

		// Reset the form after successful submission
		form.reset();

		// No longer need to set value here, parent will handle it
		// setValue("selectedMembers", [
		//   ...(getValues("selectedMembers") || []),
		//   user.id,
		// ]);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogOverlay className="bg-black/40 backdrop-blur-sm" />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Invite to Group</DialogTitle>
					<DialogDescription>
						Invite someone to join your group by email or by sharing a link.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel htmlFor="invite-email">Email Address</FormLabel>
									<div className="flex gap-2">
										<FormControl>
											<Input
												id="invite-email"
												placeholder="email@example.com"
												type="email"
												className="flex-1 h-10"
												{...field}
											/>
										</FormControl>
										<Button
											type="submit"
											className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2"
											disabled={form.formState.isSubmitting}
										>
											{form.formState.isSubmitting ? "Inviting..." : "Invite"}
										</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>

				<div className="relative my-4">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Or share link
						</span>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Input
						id="invite-link"
						readOnly
						value={inviteLink}
						className="flex-1 h-10"
					/>
					<Button variant="outline" size="icon" onClick={handleCopy}>
						{copied ? (
							<Check className="w-4 h-4" />
						) : (
							<Copy className="w-4 h-4" />
						)}
						<span className="sr-only">Copy link</span>
					</Button>
				</div>

				<div className="flex justify-start pt-4">
					<DialogTrigger asChild>
						<Button variant="outline">Close</Button>
					</DialogTrigger>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default InviteToGroup;
