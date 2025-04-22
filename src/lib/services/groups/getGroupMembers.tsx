import { useQuery } from "@tanstack/react-query";
import { getGroupMembersByGroupId } from "./groupService";

export default function useGetGroupMembers(groupId: string) {
  const { data: groupMembers, isLoading } = useQuery({
    queryKey: ["group_members", groupId],
    queryFn: async () => {
      const members = await getGroupMembersByGroupId(groupId);
      return members;
    },
    enabled: !!groupId,
  });
  return { groupMembers, isLoading };
}
