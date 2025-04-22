import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Activities from "./dashboard/Activities";

export function DataTable() {
	return (
		<Tabs
			defaultValue="recent-activity"
			className="w-full flex-col justify-start gap-6"
		>
			<div className="flex items-center justify-between px-4 lg:px-6">
				<TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
					<TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
				</TabsList>
			</div>
			<TabsContent
				value="recent-activity"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 "
			>
				<Activities />
			</TabsContent>
		</Tabs>
	);
}
