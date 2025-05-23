import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link2, Plus, Users } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import CreateGroup from "./CreateGroup";
import JoinGroup from "@/components/join-group";
import ArchivedGroup from "@/components/dashboard/ArchivedGroup";
import useGetGroups from "@/lib/services/groups/getGroupsForUser";
import { formatNaira } from "@/lib/utils";
import { toast } from "sonner";

const Group = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { groups: filteredGroups } = useGetGroups();
  const [searchParams, setSearchParams] = useSearchParams();
  const joinGroupId = searchParams.get("join"); // Get the 'join' search param

  const closeJoinModal = () => {
    searchParams.delete("join");
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-8 bg-transparent relative">
      {isOpen ? (
        <CreateGroup onCancel={setIsOpen} />
      ) : (
        <>
          <div className="bg-transparent flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-transparent bg-clip-text">
                  My Groups
                </span>
              </h1>
              <p className="text-muted-foreground">
                Manage your expense groups
              </p>
            </div>
            <Button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 group"
            >
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
              Create Group
            </Button>
          </div>
          <div className="space-y-4 bg-transparent">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 bg-transparent">
              {!filteredGroups ? (
                <div className="mt-4 space-y-4">
                  {[...Array(2)].map((_, index) => (
                    <div
                      key={`skeleton-group-${index}`}
                      className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : null}
              {filteredGroups?.length === 0 ? (
                <ArchivedGroup />
              ) : (
                (filteredGroups ?? []).map((group) => (
                  <Card
                    key={group.id}
                    className="rounded-xl bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md border dark:border-border-dark text-sidebar-foreground dark:text-sidebar-foreground-dark"
                  >
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="font-semibold tracking-tight text-xl text-sidebar-foreground dark:text-sidebar-foreground-dark">
                        {group.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {group.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="flex items-center justify-between text-md">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sidebar-foreground dark:text-sidebar-foreground-dark">
                            {group.memberCount} members
                          </span>
                        </div>
                        <span className="text-sidebar-foreground dark:text-sidebar-foreground-dark">
                          {group.expenseCount} expenses
                        </span>
                      </div>
                      <div className="text-sm font-medium">
                        {group.balance.amount > 0 ? (
                          <span
                            className={
                              group.balance.isOwed
                                ? "text-red-500 dark:text-red-400"
                                : "text-green-600 dark:text-green-500"
                            }
                          >
                            {group.balance.isOwed ? "You owe" : "You are owed"}{" "}
                            {formatNaira(group.balance.amount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Settled up
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-3 text-sidebar-foreground dark:text-sidebar-foreground-dark"></div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 w-10 border-2 border-input text-sidebar-foreground dark:text-sidebar-foreground-dark rounded-full flex justify-center items-center cursor-pointer"
                            onClick={() => {
                              const inviteLink = `${window.location.origin}/invite/${group.id}`;
                              navigator.clipboard.writeText(inviteLink);
                              toast.success("Invite link copied to clipboard!");
                            }}
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                          <Link to={`/dashboard/groups/${group.id}`}>
                            <Button className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white cursor-pointer hover:shadow-xl shadow-md dark:text-sidebar-foreground-dark px-3 h-9 rounded-md flex justify-center items-center w-[100px]">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              <Card className="rounded-xl bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md border dark:border-border-dark text-sidebar-foreground dark:text-sidebar-foreground-dark flex h-full flex-col items-center justify-center p-6">
                <CardContent className="flex flex-col items-center justify-center p-0">
                  <div className="rounded-full bg-[#4F32FF]/10 p-4 mb-4">
                    <Users className="h-8 w-8 text-[#4F32FF]" />
                  </div>
                  <h3 className="mb-2 text-lg font-medium text-sidebar-foreground dark:text-sidebar-foreground-dark">
                    Create a new group
                  </h3>
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    Start splitting expenses with friends, roommates, or travel
                    buddies
                  </p>
                  <Button
                    className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 group"
                    onClick={() => setIsOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                    New Group
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Join Group Modal */}
      {joinGroupId && (
        <JoinGroup
          groupId={joinGroupId}
          isOpen={!!joinGroupId}
          onClose={closeJoinModal}
          onAccept={() => {
            toast.success("You have successfully joined the group!");
            closeJoinModal();
          }}
          onDecline={() => {
            toast.info("You declined the invitation.");
            closeJoinModal();
          }}
        />
      )}
    </div>
  );
};

export default Group;
