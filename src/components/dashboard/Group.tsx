import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";

function Group() {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<Card className="overflow-hidden hover:shadow-glow transition-all duration-300 animate-in bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md">
				<CardHeader className="p-4">
					<CardTitle className="text-lg">Roomates</CardTitle>
					<CardDescription>3 members • 10 expenses</CardDescription>
				</CardHeader>
				<div className="flex ml-4 justify-between">
					<div className="flex">
						{[1, 2, 3].map((j) => (
							<Avatar
								key={j}
								className="border-2 border-background animate-float"
								style={{ animationDelay: `${j * 0.1}s` }}
							>
								<AvatarImage
									src={`/placeholder.svg?height=32&width=32&text=${j}`}
								/>
								<AvatarFallback>U{j}</AvatarFallback>
							</Avatar>
						))}
					</div>

					<Button
						size="sm"
						className="group bg-transparent text-black shadow-none"
					>
						View
					</Button>
				</div>
			</Card>
		</div>
	);
}

export default Group;
