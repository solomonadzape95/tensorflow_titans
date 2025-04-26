import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { getGroupNameAndCreator } from "@/lib/services/groups/groupService";
import { joinGroup } from "@/lib/services/userService";
import { protectPage } from "@/lib/services/authService";
import { useLoaderData } from "react-router";
import { queryClient } from "@/lib/queryClient";

type JoinGroupProps = {
  groupId: string;
  onAccept: () => void;
  onDecline: () => void;
  isOpen: boolean;
  onClose: () => void;
};

const JoinGroup = ({
  groupId,
  onAccept,
  onDecline,
  isOpen,
  onClose,
}: JoinGroupProps) => {
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof protectPage>>;
  const {
    mutate: fetchGroupDetails,
    data: groupDetails,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async () => {
      return await getGroupNameAndCreator(groupId);
    },
    onError: () => {
      toast.error("Failed to fetch group details. Please try again.");
    },
  });

  // Mutation to join the group
  const { mutateAsync: joinGroupMutation, isPending: isJoining } = useMutation({
    mutationFn: async () => {
      return await joinGroup(loaderData.user.id, groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onAccept();
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to join the group. Please try again."
      );
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchGroupDetails();
    }
  }, [isOpen, fetchGroupDetails]);

  if (isPending) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center text-gray-500">
            Loading group details...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError || !groupDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center text-red-500">
            Failed to load group details.
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { groupName, creatorName, createdAt } = groupDetails;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            You've been invited to join
          </DialogTitle>
        </DialogHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-bold text-primary">{groupName}</span> created
            by <span className="font-bold text-primary">{creatorName}</span> on{" "}
            <span className="font-medium">
              {new Date(createdAt).toLocaleDateString()}
            </span>
            .
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() =>
                toast.promise(joinGroupMutation(), {
                  loading: "Joining group...",
                  success: "You have successfully joined the group!",
                  error: "Failed to join the group. Please try again.",
                })
              }
              disabled={isJoining}
              className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white px-6 py-2 rounded-lg"
            >
              {isJoining ? "Joining..." : "Accept"}
            </Button>
            <Button
              onClick={onDecline}
              variant="outline"
              className="border-gray-300 text-gray-700 px-6 py-2 rounded-lg"
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroup;
