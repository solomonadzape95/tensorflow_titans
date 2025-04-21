import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="grid place-content-center space-y-10 h-[calc(100vh-150px)]">
      <span className="flex items-center justify-center w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">
        <img src="/404.svg" className="w-full h-full" />
      </span>
      <button>
        <Link
          to={window.history.state?.back || "/dashboard"}
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
