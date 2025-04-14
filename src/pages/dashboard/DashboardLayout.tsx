import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { MobileNav } from "./MobileNav";
import { Outlet } from "react-router";

function DashboardLayout() {
  return (
    <div className="bg-background dark:bg-[radial-gradient(circle_at_top_right,#4f32ff26,transparent_90%),radial-gradient(circle_at_bottom_left,#f51d7826,transparent_50%)] text-foreground dark:text-foreground-dark flex overflow-hidden max-h-screen fixed w-full">
      <Sidebar />

      <div className="no-scrollbar flex-1 overflow-scroll  relative">
        <header className="sticky top-0 z-10 w-full border-b left-0 backdrop-blur-lg flex h-16 md:h-20 items-center px-4 md:px-6 bg-background/60 shadow-md">
          <MobileNav />
          <Navbar />
        </header>
        <main className="mt-8 bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
