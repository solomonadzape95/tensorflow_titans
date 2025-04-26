import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type InviteToGroupFormData, inviteToGroupSchema } from "@/lib/schema";
import { findUserByEmail } from "@/lib/services/userService"; // Import Profile type
import { capitalizeWords } from "@/lib/utils";
import type { Tables } from "@/types/database.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type InviteToGroupProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onUserInvited: (
    user: Omit<Tables<"profiles">, "created_at" | "updated_at">
  ) => void;
  inviteLink?: string | null;
};

const InviteToGroup = ({
  isOpen,
  onOpenChange,
  userId,
  onUserInvited,
  inviteLink = null,
}: InviteToGroupProps) => {
  const form = useForm<InviteToGroupFormData>({
    resolver: zodResolver(inviteToGroupSchema),
    defaultValues: {
      email: "",
    },
  });

  const [isCopied, setIsCopied] = useState(false);

  const onSubmit = async (data: InviteToGroupFormData) => {
    const user = await findUserByEmail(data.email, userId);

    if (user === null) {
      toast.error("User not found. Please check the email address.");
      return;
    }

    toast.success(
      `Successfully invited ${capitalizeWords(user.full_name)} to the group.`
    );

    onUserInvited(user);

    form.reset();
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;

    const link = `${window.location.origin}/invite/${inviteLink}`;
    try {
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (error: unknown) {
      toast.error(
        `Failed to copy the invite link: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to Group</DialogTitle>
          <DialogDescription>
            Invite someone to join your group by email or by sharing a link.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="invite-email">Email Address</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        id="invite-email"
                        placeholder="email@example.com"
                        type="email"
                        className="flex-1 h-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? "Inviting..." : "Invite"}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {/* Link Copying Section */}
        {inviteLink && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Invite Link
            </h3>
            <div className=" bg-gray-100 rounded-lg flex items-center gap-2">
              <Input
                value={`${window.location.origin}/invite/${inviteLink}`}
                readOnly
                disabled
                className="flex-1 h-10 bg-gray-200 text-gray-700 cursor-not-allowed"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex items-center gap-1 cursor-pointer"
              >
                <Copy className="h-4 w-4" />
                {isCopied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <DialogTrigger asChild>
            <Button variant="outline">Close</Button>
          </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteToGroup;
