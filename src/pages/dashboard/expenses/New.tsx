import { AddExpenseForm } from "./AddExpenseForm";

const NewExpense = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add an Expense</h1>
        <p className="text-muted-foreground">
          Record a new expense and split it with your group
        </p>
      </div>
      <AddExpenseForm />
    </div>
  );
};

export default NewExpense;

