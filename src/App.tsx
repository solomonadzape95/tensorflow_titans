import "./App.css";
import Dashboard from "./pages/dashboard/Dashboard";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <div>
      <Login />
      <SignUp />
      <Dashboard />
    </div>
  );
}

export default App;
