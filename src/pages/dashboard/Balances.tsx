import { Link } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Check } from "lucide-react"

const balanceData = [
    {
        id: 1,
        name: "Alex Johnson",
        avatar: "/placeholder.svg?height=40&width=40&text=AJ",
        initials: "AJ",
        owesYou: 125.5,
        youOwe: 0,
        net: 125.5,
    },
    {
        id: 2,
        name: "Sarah Miller",
        avatar: "/placeholder.svg?height=40&width=40&text=SM",
        initials: "SM",
        owesYou: 0,
        youOwe: 74.61,
        net: -74.61,
    },
    {
        id: 3,
        name: "Mike Wilson",
        avatar: "/placeholder.svg?height=40&width=40&text=MW",
        initials: "MW",
        owesYou: 195.0,
        youOwe: 0,
        net: 195.0,
    },
    {
        id: 4,
        name: "Emily Davis",
        avatar: "/placeholder.svg?height=40&width=40&text=ED",
        initials: "ED",
        owesYou: 0,
        youOwe: 0,
        net: 0,
    },
]

const Balances = () => {
    return (
        <div className="space-y-8">
            <div className="animate-in">
                <h1 className="text-3xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-transparent bg-clip-text">
                        Balances
                    </span>
                </h1>
                <p className="text-muted-foreground">Track who owes you and who you owe</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="gap-3 py-4">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-display bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-transparent bg-clip-text">$245.89</div>
                    </CardContent>
                </Card>
                <Card className="gap-3 py-4">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium">You are owed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500 font-display">$320.50</div>
                    </CardContent>
                </Card>
                <Card className="gap-3 py-4">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm font-medium">You owe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500 font-display">$74.61</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="gap-3 py-4">
                <CardHeader>
                    <CardTitle className="font-display text-2xl">Balance Overview</CardTitle>
                    <CardDescription>Your current balances with friends</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="friends" className="space-y-4">
                <TabsList className="glass">
                    <TabsTrigger
                        value="friends"
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                    >
                        Friends
                    </TabsTrigger>
                    <TabsTrigger
                        value="groups"
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                    >
                        Groups
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="friends" className="space-y-4 animate-in">
                    <div className="space-y-4">
                        {balanceData.map((balance, index) => (
                            <Card
                                key={index}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={balance.avatar} alt={balance.name} />
                                                <AvatarFallback>{balance.initials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{balance.name}</p>
                                                {balance.net !== 0 && (
                                                    <p className={`text-sm ${balance.net > 0 ? "text-green-500" : "text-red-500"}`}>
                                                        {balance.net > 0
                                                            ? `owes you $${balance.net.toFixed(2)}`
                                                            : `you owe $${Math.abs(balance.net).toFixed(2)}`}
                                                    </p>
                                                )}
                                                {balance.net === 0 && <p className="text-sm text-muted-foreground">all settled up</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {balance.net !== 0 && (
                                                <Button size="sm" className="group" asChild>
                                                    <Link to='/'>
                                                        Settle Up
                                                        <ArrowRight className="ml-2 h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {balance.net === 0 && (
                                                <Button size="sm" className="text-green-500" disabled>
                                                    <Check className="mr-1 h-4 w-4" />
                                                    Settled
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="sm" className="group" asChild>
                                                <Link to="/">
                                                    <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="groups" className="space-y-4 animate-in">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {["Roommates", "Trip to Paris", "Dinner Club", "Office Lunch"].map((group, i) => (
                            <Card
                                key={i}

                                className="overflow-hidden"
                            >
                                <CardHeader className="p-4">
                                    <CardTitle className="text-lg font-display">{group}</CardTitle>
                                    <CardDescription>
                                        {i === 0 ? (
                                            <span className="text-green-500">You're owed $195.00</span>
                                        ) : i === 1 ? (
                                            <span className="text-red-500">You owe $74.61</span>
                                        ) : (
                                            "All settled up"
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((j) => (
                                                <Avatar
                                                    key={j}
                                                    className="border-2 border-background"
                                                >
                                                    <AvatarFallback>U{j}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                        <Button size="sm" className="" variant='outline' asChild>
                                            <Link to='/'>
                                                View
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Balances;