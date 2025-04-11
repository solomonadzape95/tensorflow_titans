import type React from "react";

import { useState } from "react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon,
  DollarSign,
  Home,
  Receipt,
  ShoppingBag,
  Utensils,
  Car,
  Plane,
  Film,
  Wifi,
} from "lucide-react";

const categories = [
  { id: "food", name: "Food & Drink", icon: Utensils },
  { id: "groceries", name: "Groceries", icon: ShoppingBag },
  { id: "housing", name: "Housing", icon: Home },
  { id: "transportation", name: "Transportation", icon: Car },
  { id: "travel", name: "Travel", icon: Plane },
  { id: "entertainment", name: "Entertainment", icon: Film },
  { id: "utilities", name: "Utilities", icon: Wifi },
  { id: "other", name: "Other", icon: Receipt },
];

const groups = [
  { id: 1, name: "Roommates" },
  { id: 2, name: "Trip to Paris" },
  { id: 3, name: "Dinner Club" },
  { id: 4, name: "Office Lunch" },
];

const members = [
  {
    id: 1,
    name: "You",
    email: "you@example.com",
    avatar: "/placeholder.svg?height=40&width=40&text=You",
    initials: "You",
  },
  {
    id: 2,
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=40&width=40&text=AJ",
    initials: "AJ",
  },
  {
    id: 3,
    name: "Sarah Miller",
    email: "sarah@example.com",
    avatar: "/placeholder.svg?height=40&width=40&text=SM",
    initials: "SM",
  },
  {
    id: 4,
    name: "Mike Wilson",
    email: "mike@example.com",
    avatar: "/placeholder.svg?height=40&width=40&text=MW",
    initials: "MW",
  },
];

export function AddExpenseForm() {
  const navigate = useNavigate();
  const [splitMethod, setSplitMethod] = useState("equal");
  const [selectedCategory, setSelectedCategory] = useState("food");
  const [isLoading, setIsLoading] = useState(false);
  const [customSplits, setCustomSplits] = useState<Record<number, number>>({
    1: 25,
    2: 25,
    3: 25,
    4: 25,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  const handleSliderChange = (memberId: number, value: number[]) => {
    const newValue = value[0];
    const currentTotal = Object.values(customSplits).reduce(
      (sum, val) => sum + val,
      0
    );
    const currentMemberValue = customSplits[memberId] || 0;
    const difference = newValue - currentMemberValue;

    if (currentTotal + difference > 100) return;

    setCustomSplits((prev) => ({
      ...prev,
      [memberId]: newValue,
    }));

    // Distribute the remaining percentage
    const remaining = 100 - (currentTotal + difference);
    const otherMembers = Object.keys(customSplits)
      .map(Number)
      .filter((id) => id !== memberId);

    if (remaining > 0 && otherMembers.length > 0) {
      const perMember = remaining / otherMembers.length;
      const newSplits = { ...customSplits, [memberId]: newValue };

      otherMembers.forEach((id) => {
        newSplits[id] = perMember;
      });

      setCustomSplits(newSplits);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in">
      <Card className="hover:shadow-glow transition-all duration-300">
        <CardHeader>
          <CardTitle className="font-display">Expense Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 animate-in">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              required
            />
          </div>

          <div className="space-y-2 animate-in animate-in-delay-1">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2 animate-in animate-in-delay-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                className="pl-10"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2 animate-in animate-in-delay-3">
            <Label htmlFor="group">Group</Label>
            <Select defaultValue="1">
              <SelectTrigger id="group" className="glass">
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent className="glass">
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 animate-in animate-in-delay-3">
            <Label>Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg glass transition-all duration-300 p-3 ${
                      selectedCategory === category.id
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "hover:bg-accent/20"
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon
                      className={`mb-1 h-6 w-6 transition-all duration-300 ${
                        selectedCategory === category.id
                          ? "text-primary animate-bounce-subtle"
                          : ""
                      }`}
                    />
                    <span className="text-xs">{category.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Split Method</Label>
            <Tabs
              value={splitMethod}
              onValueChange={setSplitMethod}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 glass">
                <TabsTrigger
                  value="equal"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                >
                  Equal
                </TabsTrigger>
                <TabsTrigger
                  value="custom"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                >
                  Custom
                </TabsTrigger>
                <TabsTrigger
                  value="percentage"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                >
                  Percentage
                </TabsTrigger>
              </TabsList>
              <TabsContent value="equal" className="mt-4 space-y-4 animate-in">
                <p className="text-sm text-muted-foreground">
                  Split equally among all members
                </p>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg glass p-3 hover:shadow-glow transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="animate-float"
                          style={{ animationDelay: `${member.id * 0.1}s` }}
                        >
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                      <span className="font-medium text-gradient">25%</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="custom" className="mt-4 space-y-4 animate-in">
                <p className="text-sm text-muted-foreground">
                  Enter custom amounts for each person
                </p>
                <RadioGroup
                  defaultValue="you-paid"
                  className="glass p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="you-paid" id="you-paid" />
                    <Label htmlFor="you-paid">
                      You paid, split multiple ways
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="someone-paid" id="someone-paid" />
                    <Label htmlFor="someone-paid">Someone else paid</Label>
                  </div>
                </RadioGroup>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="space-y-2 rounded-lg glass p-3 hover:shadow-glow transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className="animate-float"
                            style={{ animationDelay: `${member.id * 0.1}s` }}
                          >
                            <AvatarImage
                              src={member.avatar}
                              alt={member.name}
                            />
                            <AvatarFallback>{member.initials}</AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="0.00" className="w-24 pl-10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent
                value="percentage"
                className="mt-4 space-y-4 animate-in"
              >
                <p className="text-sm text-muted-foreground">
                  Adjust percentages for each person
                </p>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="space-y-2 rounded-lg glass p-3 hover:shadow-glow transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            className="animate-float"
                            style={{ animationDelay: `${member.id * 0.1}s` }}
                          >
                            <AvatarImage
                              src={member.avatar}
                              alt={member.name}
                            />
                            <AvatarFallback>{member.initials}</AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                        <span className="font-medium text-gradient">
                          {customSplits[member.id]}%
                        </span>
                      </div>
                      <Slider
                        defaultValue={[customSplits[member.id]]}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          handleSliderChange(member.id, value)
                        }
                        className="[&>.slider-track]:h-2 [&>.slider-track]:bg-secondary [&>.slider-range]:bg-gradient-to-r [&>.slider-range]:from-primary [&>.slider-range]:to-[#ff4ecd] [&>.slider-thumb]:h-5 [&>.slider-thumb]:w-5 [&>.slider-thumb]:bg-background [&>.slider-thumb]:border-2 [&>.slider-thumb]:border-primary [&>.slider-thumb]:shadow-glow"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" placeholder="Add any additional details..." />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Saving...</span>
              </div>
            ) : (
              "Save Expense"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

