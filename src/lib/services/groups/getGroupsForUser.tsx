import type { protectPage } from "@/lib/services/authService";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";
import { getGroupsForUser } from "../userService";
export default function useGetGroups() {
	const loaderData = useLoaderData() as Awaited<ReturnType<typeof protectPage>>;
	const { data: groups, isLoading } = useQuery({
		queryKey: ["groups"],
		queryFn: async () => {
			const groups = await getGroupsForUser(loaderData.user.id);
			return groups;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
	return { groups, isLoading };
}
