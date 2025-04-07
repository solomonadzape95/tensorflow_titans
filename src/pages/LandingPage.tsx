import { LuWallet } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa6";
import { IoMdContacts } from "react-icons/io";
export default function LandingPage() {
  return (
    <div>
      <div className="heading flex justify-between px-10 py-4 bg-white border-b-1">
        <div className="company'slogo flex items-center cursor-pointer">
          <LuWallet className="text-[#4a44ee] text-[25px] animation animate-bounce transition-all duration-300 ease-in-out" />
          <h2 className="text-[21px] font-bold pl-[6px] hover:text-[#9b48df] transition-all duration-300 ease-in-out ">
            SplitWise
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="border-1 border-color-red-500 bg-white text-black 
          py-[6px] px-[14px] rounded-2xl text-[15px] font-semibold 
          hover:bg-[#9b48df] hover:text-white transition-all duration-300 ease-in-out cursor-pointer"
          >
            Log in
          </button>
          <button
            className="border-1 border-color-red-500 bg-linear-to-r from-[#9b48df] to-[#d84cd4] 
            text-white py-[6px] px-[14px] rounded-2xl text-[15px] font-semibold 
          hover:bg-none hover:text-[#d84cd4] transition-all duration-300 ease-in-out cursor-pointer"
          >
            Sign up
          </button>
        </div>
      </div>

      <div className="content text-center pt-[140px] ">
        <h1 className="text-[57px] font-semibold">
          Split bills with friends,{" "}
          <span className="bg-gradient-to-r from-[#9b48df] to-[#d84cd4] bg-clip-text text-transparent">
            hassle-free,
          </span>
        </h1>
        <p className="text-gray-500 px-70 text-[22px] font-normal pt-[10px]">
          The easiest way to share expenses with friends and family and stop
          stressing about "who owes who."
        </p>
        <div className="buttons flex justify-center py-[15px] gap-5">
          <button
            className="group flex items-center bg-linear-to-r from-[#9b48df] to-[#d84cd4]
           text-white px-[30px] py-[10px] text-[15px] font-semibold rounded-xl"
          >
            Get Started
            <FaArrowRight className="ml-1 transition-all ease-in-out group-hover:translate-x-1" />
          </button>
          <button className="group border-1 border-[#9b48df] flex items-center bg-none text-[#9b48df] px-[30px] py-[10px] text-[15px] font-semibold rounded-xl">
            Try Demo
            <FaArrowRight className="ml-1 transition-all ease-in-out group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="">
          Easily create groups for trips, roommates, or events and invite
          friends to join.
        </div>
      </div>
    </div>
  );
}
