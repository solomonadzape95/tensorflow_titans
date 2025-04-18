import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router"; // Import RouterProvider
import { router } from "./App.tsx"; // Import the router
import "./index.css";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
		<Toaster />
	</StrictMode>,
);
