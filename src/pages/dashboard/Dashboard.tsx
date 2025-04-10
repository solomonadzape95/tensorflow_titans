import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { MobileNav } from "./MobileNav";
import BalanceLoyout from "../balance/BalanceLoyout";

function Dashboard() {
  return (
    <div className="h-full">
      <header className="sticky px-5 md:p-10 glass top-0 supports-[backdrop-filter]:bg-background/60 z-50  backdrop-blur  flex h-6 w-full  items-center">
        <MobileNav />
        <Navbar />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Overview Section */}

          {/*Balance section */}
          <BalanceLoyout />
          {/* <ActivityList /> */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
