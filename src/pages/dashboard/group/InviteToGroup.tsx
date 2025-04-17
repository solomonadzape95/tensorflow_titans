import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus } from "lucide-react";

const InviteToGroup = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">                
                    <Plus className="w-4 h-4 mr-2" />
                    Invite New
                </Button>
            </DialogTrigger>

            <DialogOverlay className="bg-black/40 backdrop-blur-sm" />

            <DialogContent className=" sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite to Group</DialogTitle>
                    <DialogDescription>
                        Invite someone to join your group by email or by sharing a link.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 mt-4">
                    <label htmlFor="invite-email" className="text-sm font-medium">
                        Email Address
                    </label>
                    <form className="flex gap-2 mt-2">
                        <Input
                            id="invite-email"
                            placeholder="email@example.com"
                            type="email"
                            className="flex-1 h-10"
                        />
                        <Button type="submit" className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 ">Invite</Button>
                    </form>
                </div>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or share link
                        </span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        id="invite-link"
                        readOnly
                        value="https://spliwise.com/join/abc123"
                        className="flex-1 h-10"
                    />
                    <Button variant="outline" size="icon">
                        <Copy className="w-4 h-4" />
                        <span className="sr-only">Copy link</span>
                    </Button>
                </div>

                <div className="flex justify-start pt-4">
                    <DialogTrigger asChild>
                        <Button variant="outline">Close</Button>
                    </DialogTrigger>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InviteToGroup;
