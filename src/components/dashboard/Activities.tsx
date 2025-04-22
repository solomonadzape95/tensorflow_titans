import type { protectPage } from "@/lib/services/authService";
import { getRecentActivities } from "@/lib/services/userService";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";
import Activity from "./Activity";

function Activities() {
	const loaderData = useLoaderData() as Awaited<ReturnType<typeof protectPage>>;

	const { data } = useSuspenseQuery({
		queryKey: ["user", "stats", "recent-activities", loaderData.user.id],
		queryFn: async () => await getRecentActivities(loaderData.user.id),
	});

	return (
		<div>
			{data.map((activity) => (
				<Activity key={activity.id} activity={activity} /> // Add key prop
			))}
		</div>
	);
}

export default Activities;
