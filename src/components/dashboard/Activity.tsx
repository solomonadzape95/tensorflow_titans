import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatNaira } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Receipt, Utensils } from "lucide-react";

type ActivityData = {
	id: string;
	description: string;
	amount: number;
	expense_date: string | null;
	payer: {
		full_name: string | null;
		avatar_url: string | null;
	} | null;
};

interface ActivityProps {
	activity: ActivityData;
}

const getActivityIcon = (description: string | null) => {
	if (
		description?.toLowerCase().includes("food") ||
		description?.toLowerCase().includes("dinner") ||
		description?.toLowerCase().includes("lunch")
	) {
		return Utensils;
	}

	return Receipt;
};

function Activity({ activity }: ActivityProps) {
	const payerName = activity.payer?.full_name || "Unknown User";
	const payerAvatar = activity.payer?.avatar_url;
	const payerInitials = payerName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.substring(0, 2)
		.toUpperCase();

	const formattedDate = activity.expense_date
		? formatDistanceToNow(new Date(activity.expense_date), { addSuffix: true })
		: "Unknown date";

	const Icon = getActivityIcon(activity.description);

	return (
		<Card
			key={activity.id}
			className="p-4 bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md"
		>
			<div className="flex items-start gap-4">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
					<Icon className="h-5 w-5 text-primary" />
				</div>
				<div className="flex-1 space-y-1">
					<div className="flex items-center justify-between">
						<p className="font-medium capitalize">
							{activity.description.toLowerCase()}
						</p>
						<p className="font-medium">{formatNaira(activity.amount)}</p>
					</div>
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<Avatar className="h-6 w-6">
								<AvatarImage src={payerAvatar || undefined} alt={payerName} />
								<AvatarFallback>{payerInitials}</AvatarFallback>
							</Avatar>
							<span className="capitalize">{payerName.toLowerCase()}</span>
						</div>
						<span>{formattedDate}</span>
					</div>
				</div>
			</div>
		</Card>
	);
}

export default Activity;
