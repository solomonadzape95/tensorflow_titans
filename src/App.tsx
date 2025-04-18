import { createBrowserRouter } from "react-router";
import type { RouteObject } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import "./App.css";
import GroupDetails from "./components/dashboard/GroupDetails";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import ExpensesOverview from "./pages/dashboard/expenses/Expenses";
import NewExpense from "./pages/dashboard/expenses/New";
import CreateGroup from "./pages/dashboard/group/CreateGroup";
import Group from "./pages/dashboard/group/Group";
import NotFound from "./pages/not-found";

const routes: RouteObject[] = [
	{ path: "/", Component: LandingPage },
	{ path: "/login", Component: Login },
	{ path: "/signup", Component: SignUp },
	{
		path: "/dashboard",
		Component: Dashboard,
		children: [
			{ index: true, Component: Overview },
			{ path: "groups", Component: Group },
			{ path: "groups/:id", Component: GroupDetails },
			{ path: "groups/create", Component: CreateGroup }, // Changed path for consistency
			{ path: "expenses", Component: ExpensesOverview },
			{ path: "expenses/new", Component: NewExpense },
		],
	},
	{ path: "*", Component: NotFound }, // Consider a dedicated 404 page later
];

export const router = createBrowserRouter(routes);
