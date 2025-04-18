import { Routes, Route } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import "./App.css";
import Dashboard from "./pages/dashboard/DashboardLayout";
import Group from "./pages/dashboard/group/Group";
import ExpensesOverview from "./pages/dashboard/expenses/Expenses";
import NewExpense from "./pages/dashboard/expenses/New";
import LandingPage from "./pages/LandingPage";
import Overview from "./pages/dashboard/Overview";
import CreateGroup from "./pages/dashboard/group/CreateGroup";
import GroupDetails from "./components/dashboard/GroupDetails";
import Balances from "./pages/dashboard/Balances";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Overview />} />
        <Route path="groups" element={<Group />} />
        <Route path="/dashboard/groups/:id" element={<GroupDetails />} />
        <Route path="/dashboard/group/create-group" element={<CreateGroup />} />
        <Route path="expenses" element={<ExpensesOverview />} />
        <Route path="expenses/new" element={<NewExpense />} />
        <Route path="balances" element={<Balances />} />
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
