import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="grid place-content-center space-y-10 h-[calc(100vh-150px)]">
      <p className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-transparent bg-clip-text font-medium text-5xl">
        Page not found
      </p>
      <button>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium relative bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white h-10 px-4 py-2 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Link>
      </button>
    </div>
  );
};

export default NotFound;
