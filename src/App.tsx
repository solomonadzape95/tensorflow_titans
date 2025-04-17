import { Routes, Route } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import "./App.css";
import Dashboard from "./pages/dashboard/DashboardLayout";
import Group from "./pages/dashboard/Group";
import ExpensesOverview from "./pages/dashboard/expenses/Expenses";
import NewExpense from "./pages/dashboard/expenses/New";
import LandingPage from "./pages/LandingPage";
import Overview from "./pages/dashboard/Overview";
import GroupDetails from "./components/dashboard/GroupDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Overview />} />
        <Route path="/dashboard/groups" element={<Group />} />
        <Route path="/dashboard/groups/:id" element={<GroupDetails />} />
        <Route path="/dashboard/expenses" element={<ExpensesOverview />} />
        <Route path="/dashboard/expenses/new" element={<NewExpense />} />
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
