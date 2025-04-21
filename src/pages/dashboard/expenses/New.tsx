import { AddExpenseForm } from "./AddExpenseForm";

const NewExpense = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {" "}
          <span className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-transparent bg-clip-text">
            Add an Expense
          </span>
        </h1>
        <p className="text-muted-foreground">
          Add a new expense and split it with your group
        </p>
      </div>
      <AddExpenseForm />
    </div>
  );
};

export default NewExpense;

