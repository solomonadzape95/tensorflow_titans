import { Plus, Users, Link as LinkIcon } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useState } from 'react'
import ArchivedGroup from '@/components/dashboard/ArchivedGroup';
import { Link } from 'react-router';

interface GroupMember {
    initial: string;
}

interface GroupData {
    id: string;
    title: string;
    description: string;
    memberCount: number;
    expenseCount: number;
    balance: {
        amount: number;
        isOwed: boolean;
    };
    members: GroupMember[];
}

const Group = () => {
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

    const groups: GroupData[] = [
        {
            id: '1',
            title: 'Roommates',
            description: 'Rent, utilities, and household expenses',
            memberCount: 4,
            expenseCount: 12,
            balance: {
                amount: 195.00,
                isOwed: true,
            },
            members: [
                { initial: 'A' },
                { initial: 'B' },
                { initial: 'C' },
                { initial: '1+' },
            ],
        },
        {
            id: '2',
            title: 'Trip to Vegas',
            description: 'Travel expenses for our vacation',
            memberCount: 3,
            expenseCount: 8,
            balance: {
                amount: 74.61,
                isOwed: false,
            },
            members: [
                { initial: 'A' },
                { initial: 'B' },
            ],
        },
    ];

    const filteredGroups = activeTab === 'active' ? groups : [];

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="space-y-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            <span className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-transparent bg-clip-text">
                                My Groups
                            </span>
                        </h1>
                        <p className="text-muted-foreground">Manage your expense groups</p>
                    </div>
                    <Link
                        to="/dashboard/group/create-group"
                        className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 group"
                    >
                        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                        Create Group
                    </Link>
                </div>

                <div className="space-y-4">
                    <ToggleGroup
                        type="single"
                        defaultValue={activeTab}
                        onValueChange={(value) => setActiveTab(value as 'active' | 'archived')}
                        className="inline-flex h-8 items-center justify-center rounded-lg p-1.5 bg-sidebar dark:bg-sidebar-dark border-r dark:border-r-border-dark text-sidebar-foreground dark:text-sidebar-foreground-dark border border-muted-foreground box-content"
                    >
                        <ToggleGroupItem
                            value="active"
                            className="data-[state=on]:bg-[#4F32FF]/20 data-[state=on]:text-[#4F32FF] hover:bg-transparent hover:text-muted-foreground  px-4 py-1 text-sm font-medium cursor-pointer rounded-sm transition-colors"
                        >
                            Active
                        </ToggleGroupItem>
                        <ToggleGroupItem
                            value="archived"
                            className="data-[state=on]:bg-[#4F32FF]/20 data-[state=on]:text-[#4F32FF] px-4 py-1 text-sm font-medium cursor-pointer rounded-sm transition-colors hover:bg-transparent hover:text-muted-foreground"
                        >
                            Archived
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <div className="space-y-4">
                        {activeTab === 'active' ? (

                            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredGroups.map((group) => (
                                    <Card key={group.id} className="rounded-xl bg-sidebar dark:bg-sidebar-dark border dark:border-border-dark text-sidebar-foreground dark:text-sidebar-foreground-dark">
                                        <CardHeader className="p-4 pb-0">
                                            <CardTitle className="font-semibold tracking-tight text-lg text-sidebar-foreground dark:text-sidebar-foreground-dark">{group.title}</CardTitle>
                                            <CardDescription className="text-muted-foreground">{group.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0 space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sidebar-foreground dark:text-sidebar-foreground-dark">{group.memberCount} members</span>
                                                </div>
                                                <span className="text-sidebar-foreground dark:text-sidebar-foreground-dark">{group.expenseCount} expenses</span>
                                            </div>
                                            <div className={`text-sm font-medium ${group.balance.isOwed ? 'text-green-500' : 'text-red-400'}`}>
                                                {group.balance.isOwed ? `You're owed $${group.balance.amount.toFixed(2)}` : `You owe $${group.balance.amount.toFixed(2)}`}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex -space-x-3 text-sidebar-foreground dark:text-sidebar-foreground-dark">
                                                    {group.members.map((member, index) => (
                                                        <span
                                                            key={index}
                                                            className="relative flex h-8 w-8 shrink-0 rounded-full border-1 border-accent-foreground/10 dark:border-accent-foreground-dark/10"
                                                        >
                                                            <span className="flex h-full w-full items-center justify-center rounded-full bg-accent dark:bg-accent-dark text-accent-foreground dark:text-accent-foreground-dark border border-accent-foreground text-xs">
                                                                {member.initial}
                                                            </span>
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="h-8 w-8 border-2 border-input text-sidebar-foreground dark:text-sidebar-foreground-dark rounded-full flex justify-center items-center">
                                                        <LinkIcon className="h-4 w-4" />
                                                    </button>
                                                    <a
                                                        href="/"
                                                        className="bg-transparent border border-black/20 dark:border-white/20 text-sidebar-foreground dark:text-sidebar-foreground-dark px-3 h-9 rounded-md flex justify-center items-center"
                                                    >
                                                        View
                                                    </a>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                <Card className="rounded-xl bg-sidebar dark:bg-sidebar-dark border dark:border-border-dark text-sidebar-foreground dark:text-sidebar-foreground-dark flex h-full flex-col items-center justify-center p-6">
                                    <CardContent className="flex flex-col items-center justify-center p-0">
                                        <div className="rounded-full bg-[#4F32FF]/10 p-4 mb-4">
                                            <Users className="h-8 w-8 text-[#4F32FF]" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium text-sidebar-foreground dark:text-sidebar-foreground-dark">Create a new group</h3>
                                        <p className="mb-4 text-center text-sm text-muted-foreground">
                                            Start splitting expenses with friends, roommates, or travel buddies
                                        </p>
                                        <Link
                                            className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 group"
                                            to="/dashboard/group/create-group"
                                        >
                                            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                                            New Group
                                        </Link>
                                    </CardContent>
                                </Card>

                            </div>
                        ) : (
                            <ArchivedGroup />
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Group