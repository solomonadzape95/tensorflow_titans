import { Routes, Route } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import "./App.css";
import Dashboard from "./pages/dashboard/DashboardLayout";
import Group from "./pages/dashboard/Group";
import Overview from "./components/dashboard/Overview";
import AddNewExpense from "./components/dashboard/AddNewExpense";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="/dashboard/group" element={<Group />} />
        <Route path="/dashboard/overview" element={<Overview />} />
        <Route path="/dashboard/expenses/new" element={<AddNewExpense />} />
      </Route>
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;
