import { createBrowserRouter } from "react-router";
import type { RouteObject } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import "./App.css";
import GroupDetails from "./components/dashboard/GroupDetails";
import { protectPage } from "./lib/services/authService";
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
		loader: async () => {
			// Protect the main dashboard layout as well
			return await protectPage();
		},
		children: [
			{
				index: true,
				Component: Overview,
				// Loader already present
				loader: async () => {
					return await protectPage();
				},
			},
			{
				path: "groups",
				Component: Group,
				loader: async () => {
					// Protect groups route
					return await protectPage();
				},
			},
			{
				path: "groups/:id",
				Component: GroupDetails,
				loader: async () => {
					// Protect group details route
					return await protectPage();
				},
			},
			{
				path: "groups/create",
				Component: CreateGroup,
				loader: async () => {
					// Protect create group route
					return await protectPage();
				},
			},
			{
				path: "expenses",
				Component: ExpensesOverview,
				loader: async () => {
					// Protect expenses overview route
					return await protectPage();
				},
			},
			{
				path: "expenses/new",
				Component: NewExpense,
				loader: async () => {
					// Protect new expense route
					return await protectPage();
				},
			},
		],
	},
	{ path: "*", Component: NotFound }, // Consider a dedicated 404 page later
];

export const router = createBrowserRouter(routes);
