import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { MobileNav } from "./MobileNav";

function Dashboard() {
  return (
    <div className=" bg-primary min-h-screen">
      <header className="sticky px-5 md:p-10  top-0 border-b border-gray-500 z-50  backdrop-blur-lg flex h-16 w-full  items-center">
        <MobileNav />
        <Navbar />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Overview Section */}

          {/* Activity List */}
          {/* <ActivityList /> */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
