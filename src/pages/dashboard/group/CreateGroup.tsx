import { Plus, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import InviteToGroup from "./InviteToGroup";

const members = [
    { name: "Alex Johnson", email: "alex@example.com", initials: "AJ" },
    { name: "Sarah Miller", email: "sarah@example.com", initials: "SM" },
    { name: "Mike Wilson", email: "mike@example.com", initials: "MW" },
    { name: "Emily Davis", email: "emily@example.com", initials: "ED" },
    { name: "John Smith", email: "john@example.com", initials: "JS" },
];

const CreateGroup = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-6 py-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create a New Group</h1>
                <p className="text-muted-foreground">
                    Create a group to start splitting expenses with friends.
                </p>
            </div>

            <form>
                <Card>
                    <CardHeader>
                        <h3 className="text-2xl font-semibold tracking-tight">Group Details</h3>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <Tabs defaultValue="home" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="home" className="data-[state=on]:bg-[#4F32FF]/20 data-[state=on]:text-[#4F32FF] hover:bg-transparent hover:text-muted-foreground  px-4 py-1 text-sm font-medium cursor-pointer rounded-sm transition-colors">Home</TabsTrigger>
                                <TabsTrigger value="trip" className="data-[state=on]:bg-[#4F32FF]/20 data-[state=on]:text-[#4F32FF] hover:bg-transparent hover:text-muted-foreground  px-4 py-1 text-sm font-medium cursor-pointer rounded-sm transition-colors">Trip</TabsTrigger>
                                <TabsTrigger value="couple" className="data-[state=on]:bg-[#4F32FF]/20 data-[state=on]:text-[#4F32FF] hover:bg-transparent hover:text-muted-foreground  px-4 py-1 text-sm font-medium cursor-pointer rounded-sm transition-colors">Couple</TabsTrigger>
                                <TabsTrigger value="custom" className="data-[state=on]:bg-[#4F32FF]/20 data-[state=on]:text-[#4F32FF] hover:bg-transparent hover:text-muted-foreground  px-4 py-1 text-sm font-medium cursor-pointer rounded-sm transition-colors">Custom</TabsTrigger>
                            </TabsList>

                            <TabsContent value="home">
                                <p className="text-sm text-muted-foreground">Rent, utilities, groceries, and other household expenses</p>
                            </TabsContent>
                            <TabsContent value="trip">
                                <p className="text-sm text-muted-foreground">Travel expenses, accommodations, activities, and meals</p>
                            </TabsContent>
                            <TabsContent value="couple">
                                <p className="text-sm text-muted-foreground">Shared expenses between partners</p>
                            </TabsContent>
                            <TabsContent value="custom">
                                <p className="text-sm text-muted-foreground">Create a group from scratch.</p>
                            </TabsContent>
                        </Tabs>

                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Group Name
                            </label>
                            <Input id="name" placeholder="Enter group name" required />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">
                                Description (Optional)
                            </label>
                            <Textarea
                                id="description"
                                className="bg-background"
                                placeholder="What's this group for?"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Add Members</label>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="cursor-pointer">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Invite New
                                    </Button>
                                    <InviteToGroup />
                                    <Button variant="outline" className="cursor-pointer">
                                        <Link className="w-4 h-4 mr-2" />
                                        Copy Link
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {members.map((member) => (
                                    <div
                                        key={member.email}
                                        className="flex items-center justify-between border rounded-lg p-3 cursor-pointer hover:bg-background/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`/placeholder.svg?text=${member.initials}`} />
                                                <AvatarFallback>{member.initials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>

                    <div className="flex justify-between px-6 pb-6 pt-0">
                        <Button variant="outline" className="cursor-pointer h-10 px-4 py-4">Cancel</Button>
                        <Button type="submit" className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 cursor-pointer">
                            Create Group
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default CreateGroup;
