import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Receipt, Plus } from "lucide-react";
import { Link } from "react-router";

export default function NoExpense({
    hasFilters = false,
    message = "Add your first expense to get started",
    showAddButton = true
}) {
    return (
        <Card className="p-8 text-center">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-muted p-4">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>No expenses found</CardTitle>
                <CardDescription>
                    {hasFilters ? "Try adjusting your filters" : message}
                </CardDescription>
                {showAddButton && !hasFilters && (
                    <Button asChild variant="gradient"
                        className="group bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white">
                        <Link to="/dashboard/expenses/new">
                            <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                            Add Expense
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}