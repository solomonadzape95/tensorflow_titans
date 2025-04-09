'use client'

import { Plus, Users, Link } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const Group = () => {
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
                    <a
                        href="/"
                        className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 group"
                    >
                        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                        Create Group
                    </a>
                </div>

                <div className="space-y-4">
                    <ToggleGroup
                        type="single"
                        defaultValue="active"
                        className="inline-flex h-8 items-center justify-center rounded-lg p-1.5 text-muted-foreground bg-[#32374d99] border border-muted-foreground box-content"
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
                        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            <Card className="rounded-xl border border-[#4247704d] bg-[#17192399]">
                                <CardHeader className="p-4 pb-0">
                                    <CardTitle className="font-semibold tracking-tight text-lg text-muted">Roommates</CardTitle>
                                    <CardDescription className="text-muted-foreground">Rent, utilities, and household expenses</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted">4 members</span>
                                        </div>
                                        <span className="text-muted">12 expenses</span>
                                    </div>
                                    <div className="text-sm font-medium text-green-500">You're owed $195.00</div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-3 text-muted">
                                            {['A', 'B', 'C', '1+'].map((initial, index) => (
                                                <span
                                                    key={index}
                                                    className="relative flex h-8 w-8 shrink-0 rounded-full border-2 border-accent-foreground"
                                                >
                                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted-foreground border border-accent-foreground text-xs">
                                                        {initial}
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="h-8 w-8 border-2 border-input text-muted rounded-full flex justify-center items-center">
                                                <Link className="h-4 w-4" />
                                            </button>
                                            <a
                                                href="/"
                                                className="bg-transparent border border-white/20 text-muted px-3 h-9 rounded-md flex justify-center items-center"
                                            >
                                                View
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-xl border border-[#4247704d] bg-[#17192399]">
                                <CardHeader className="p-4 pb-0">
                                    <CardTitle className="font-semibold tracking-tight text-lg text-muted">Roommates</CardTitle>
                                    <CardDescription className="text-muted-foreground">Rent, utilities, and household expenses</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted">4 members</span>
                                        </div>
                                        <span className="text-muted">12 expenses</span>
                                    </div>
                                    <div className="text-sm font-medium text-green-500">You're owed $195.00</div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-3 text-muted">
                                            {['A', 'B', 'C', '1+'].map((initial, index) => (
                                                <span
                                                    key={index}
                                                    className="relative flex h-8 w-8 shrink-0 rounded-full border-2 border-accent-foreground"
                                                >
                                                    <span className="flex h-full w-full items-center justify-center rounded-full bg-muted-foreground border border-accent-foreground text-xs">
                                                        {initial}
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="h-8 w-8 border-2 border-input text-muted rounded-full flex justify-center items-center">
                                                <Link className="h-4 w-4" />
                                            </button>
                                            <a
                                                href="/"
                                                className="bg-transparent border border-white/20 text-muted px-3 h-9 rounded-md flex justify-center items-center"
                                            >
                                                View
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-xl border border-[#4247704d] bg-[#17192399] flex h-full flex-col items-center justify-center p-6">
                                <CardContent className="flex flex-col items-center justify-center p-0">
                                    <div className="rounded-full bg-[#4F32FF]/10 p-4 mb-4">
                                        <Users className="h-8 w-8 text-[#4F32FF]" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium text-muted">Create a new group</h3>
                                    <p className="mb-4 text-center text-sm text-muted-foreground">
                                        Start splitting expenses with friends, roommates, or travel buddies
                                    </p>
                                    <a
                                        className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 group"
                                        href="/"
                                    >
                                        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                                        New Group
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Group