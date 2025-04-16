import { MdOutlineCancel } from "react-icons/md";
const ModalViewExpense = () => {
  return (
    <div className="border-1 border-[#ac4bdc] mx-[5px] w-[350px] lg:m-auto lg:w-[450px] mt-40 lg:mt-40 rounded-xl shadow-2xl px-5 pt-5 pb-[25px] ">
      <div className="flexxo flex justify-between">
        <div className="first">
          <h2 className="text-[18px] font-semibold">Dinner at Olive Garden</h2>
          <p className="text-[15px] text-gray-400">
            Today at 8:30 PM • Food & Drink
          </p>
        </div>

        <MdOutlineCancel className="text-[25px]" />
      </div>

      <div className="second-div mt-[40px] flex items-center justify-between">
        <div className="user-detail flex items-center gap-3">
          <div className="image bg-[#ac4bdc] w-[50px] h-[50px] rounded-full"></div>
          <div className="name">
            <h3 className="font-bold lg:text-[16px] text-[14px]">
              Alexander johnson
            </h3>
            <p className="text-gray-400 lg:text-[14px] text-[13px]">
              Paid $5000
            </p>
          </div>
        </div>
        <div className="group">
          <h3>Group</h3>
          <h2 className="font-bold text-[14px] lg:text-[16px]">Dinner Club</h2>
        </div>
      </div>
      <div className=" border-1 border-gray-500 mt-[20px] rounded-lg p-4">
        <h3 className="font-semibold text-[14px]">Split Details</h3>
        <div className="split-details flex justify-between mt-3">
          <h3 className="font-bold text-[14px]">You</h3>
          <h2>amount</h2>
        </div>
      </div>
      <div className="note mt-5">
        <h2 className="font-bold">Notes</h2>
        <p className="text-[15px]">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe minus
        </p>
      </div>
    </div>
  );
};

export default ModalViewExpense;
