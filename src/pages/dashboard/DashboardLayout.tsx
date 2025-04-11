import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { MobileNav } from "./MobileNav";
import { Outlet } from "react-router";

function DashboardLayout() {
  return (
    <div className="bg-background dark:bg-background-dark min-h-screen text-foreground dark:text-foreground-dark">
      <header className="sticky top-0 z-50 w-full border-b dark:border-b-border-dark backdrop-blur-lg flex h-16 md:h-20 items-center px-4 md:px-6">
        <MobileNav />
        <Navbar />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Outlet />
          {/* Overview Section */}
          {/* Activity List */}
          {/* <ActivityList /> */}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;