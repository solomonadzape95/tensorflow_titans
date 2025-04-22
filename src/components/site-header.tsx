import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router";

export function SiteHeader() {
	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 py-5 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<h1 className="text-[20px] font-semibold bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] bg-clip-text text-transparent ">
					Dashboard
				</h1>
				<div className="ml-auto flex items-center gap-2">
					<Link
						className={buttonVariants({
							variant: "ghost",
							className:
								"bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white font-semibold",
						})}
						to="/dashboard/expenses/new"
					>
						Add Expense
					</Link>
				</div>
			</div>
		</header>
	);
}
