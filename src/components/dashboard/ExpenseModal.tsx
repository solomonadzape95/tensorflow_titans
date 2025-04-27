import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNaira } from "@/lib/utils";
import { Expense } from "@/types";

interface ExpenseDetailDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExpenseModal({
  expense,
  open,
  onOpenChange,
}: ExpenseDetailDialogProps) {
  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {expense.description}
          </DialogTitle>
          <DialogDescription>
            {expense.formattedDate} • {expense.category}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Payer Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={expense?.payer?.avatar_url || ""}
                  alt={expense?.payer?.name ?? "Payer Avatar"}
                />
                <AvatarFallback>
                  {expense?.payer?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{expense?.payer?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Paid {formatNaira(expense.amount)}
                </p>
              </div>
            </div>
            <p className="text-lg font-bold">{formatNaira(expense.amount)}</p>
          </div>

          {/* Participants */}
          <div className="border-t border-muted-foreground/20 pt-4">
            <p className="font-medium">Participants</p>
            <ul className="list-disc list-inside">
              {expense.participants?.length > 0 ? (
                expense.participants.map((participant, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {participant.name}: {formatNaira(participant.amount)}
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">
                  No participants
                </li>
              )}
            </ul>
          </div>

          {/* Notes */}
          <div className="border-t border-muted-foreground/20 pt-4">
            <p className="font-medium">Descript</p>
            <p className="text-sm text-muted-foreground">
              {expense.notes || "No notes provided"}
            </p>
          </div>

          {/* Status */}
          <div className="border-t border-muted-foreground/20 pt-4">
            <p className="font-medium">Status</p>
            <p
              className={`text-sm font-medium ${
                expense.settled
                  ? "text-gray-500"
                  : expense.youOwe
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {expense.settled
                ? "Settled"
                : expense.youOwe
                ? "You owe"
                : "You are owed"}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
