import type { UserData } from "@/types";
import { Outlet, useLoaderData } from "react-router";
import { MobileNav } from "./MobileNav";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout() {
	const data = useLoaderData() as UserData;

	return (
		<div className="bg-background dark:bg-[radial-gradient(circle_at_top_right,#4f32ff26,transparent_90%),radial-gradient(circle_at_bottom_left,#f51d7826,transparent_50%)] text-foreground dark:text-foreground-dark flex min-h-screen w-full overflow-hidden">
			<Sidebar user={data} />
			<div className="flex-1 overflow-y-auto relative">
				<header className="sticky top-0 z-50 w-full border-b left-0 backdrop-blur-lg flex h-16 md:h-20 items-center px-4 md:px-6 bg-background/60 shadow-md">
					<MobileNav />
					<Navbar user={data} />
				</header>
				<main className="bg-transparent flex-1 overflow-y-auto p-4 md:p-8 min-h-screen">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

export default DashboardLayout;
