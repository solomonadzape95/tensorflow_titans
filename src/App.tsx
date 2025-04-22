import { createBrowserRouter } from "react-router";
import type { RouteObject } from "react-router";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import "./App.css";
import GroupDetails from "./components/dashboard/GroupDetails";
import RecurringExpences from "./components/dashboard/RecurringExpences";
import { queryClient } from "./lib/queryClient";
import { protectPage, redirectIfLoggedIn } from "./lib/services/authService";
import LandingPage from "./pages/LandingPage";
import Balances from "./pages/dashboard/Balances";
import Dashboard from "./pages/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Settings from "./pages/dashboard/Settings";
import ExpensesOverview from "./pages/dashboard/expenses/Expenses";
import NewExpense from "./pages/dashboard/expenses/New";
import CreateGroup from "./pages/dashboard/group/CreateGroup";
import Group from "./pages/dashboard/group/Group";
import NotFound from "./pages/not-found";

const protectedLoader = async () => {
  return await queryClient.fetchQuery({
    queryKey: ["auth", "user"],
    queryFn: protectPage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const redirectIfLoggedInLoader = async () => {
  return await queryClient.fetchQuery({
    queryKey: ["auth", "get-user"],
    queryFn: redirectIfLoggedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const routes: RouteObject[] = [
  { path: "/", Component: LandingPage },
  { path: "/login", Component: Login, loader: redirectIfLoggedInLoader },
  { path: "/signup", Component: SignUp, loader: redirectIfLoggedInLoader },
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
        children: [
          {
            path: "expenses/new",
            Component: NewExpense,
            loader: protectedLoader,
          },
        ],
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
        path: "recurring",
        Component: RecurringExpences,
        loader: protectedLoader,
      },
      {
        path: "recurring/:id",
        Component: GroupDetails,
        loader: protectedLoader,
      },
      {
        path: "balances",
        Component: Balances,
        loader: protectedLoader,
      },
      {
        path: "settings",
        Component: Settings,
        loader: protectedLoader,
      },
    ],
  },
  { path: "*", Component: NotFound }, // Consider a dedicated 404 page later
];

export const router = createBrowserRouter(routes);
