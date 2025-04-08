import "./App.css";
import Overview from "./components/dashboard/Overview";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <div>
      <Login />
      <SignUp />
      <Overview />
    </div>
  );
}

export default App;
