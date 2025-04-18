import { createBrowserRouter } from "react-router";
import type { RouteObject } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import "./App.css";
import GroupDetails from "./components/dashboard/GroupDetails";
import { queryClient } from "./lib/queryClient";
import { protectPage } from "./lib/services/authService";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import ExpensesOverview from "./pages/dashboard/expenses/Expenses";
import NewExpense from "./pages/dashboard/expenses/New";
import CreateGroup from "./pages/dashboard/group/CreateGroup";
import Group from "./pages/dashboard/group/Group";
import NotFound from "./pages/not-found";
import Balances from "./pages/dashboard/Balances";

import GroupDetails from "./components/dashboard/GroupDetails";
import Settings from "./pages/dashboard/Settings";


const protectedLoader = async () => {
	return await queryClient.fetchQuery({
		queryKey: ["auth", "user"],
		queryFn: protectPage,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

const routes: RouteObject[] = [
	{ path: "/", Component: LandingPage },
	{ path: "/login", Component: Login },
	{ path: "/signup", Component: SignUp },
	{
		path: "/dashboard",
		Component: Dashboard,
		loader: protectedLoader,
		children: [
			{
				index: true,
				Component: Overview,
				loader: protectedLoader,
			},
			{
				path: "groups",
				Component: Group,
				loader: protectedLoader,
			},
			{
				path: "groups/:id",
				Component: GroupDetails,
				loader: protectedLoader,
			},
			{
				path: "groups/create",
				Component: CreateGroup,
				loader: protectedLoader,
			},
			{
				path: "expenses",
				Component: ExpensesOverview,
				loader: protectedLoader,
			},
			{
				path: "expenses/new",
				Component: NewExpense,
				loader: protectedLoader,
			},
      {
        path: "balances",
        Component: Balances,
        loader: protectedLoader,
      },
		],
	},
	{ path: "*", Component: NotFound }, // Consider a dedicated 404 page later
];

export const router = createBrowserRouter(routes);

