import { useQuery } from "@tanstack/react-query";
import { getGroupsForUser } from "../userService";
import { protectPage } from "@/lib/services/authService";
import { useLoaderData } from "react-router";
import { GroupData } from "@/types";
export default function useGetGroups() {
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof protectPage>>;
  const { data: groups, isLoading } = useQuery<GroupData[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      const groups = await getGroupsForUser(loaderData.user.id);
      return groups;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });
  return { groups, isLoading };
}
