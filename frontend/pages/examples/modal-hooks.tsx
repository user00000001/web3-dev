import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import CustomNav from "./_components/CustomNav";
const YourApp = () => {
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  return (
    <div>
      <CustomNav></CustomNav>
      <div className=" mx-auto w-1/2 text-center flex justify-evenly hover:bg-slate-200 bg-slate-400 mt-4 rounded-lg border-dashed border space-x-5">
        {openConnectModal && (
          <button
            className=" outline-dashed p-2 bg-green-200 ring-1 shadow-red-400 shadow-md hover:scale-105 outline-1 rounded outline-red-300 text-blue-600"
            onClick={openConnectModal}
            type="button"
          >
            Open Connect Modal
          </button>
        )}
        {openAccountModal && (
          <button
            className=" outline-double p-2 bg-yellow-300 hover:scale-105 duration-300 outline-1 rounded outline-red-300 text-blue-600"
            onClick={openAccountModal}
            type="button"
          >
            Open Account Modal
          </button>
        )}
        {openChainModal && (
          <button
            className=" outline-dotted p-2 bg-red-300 hover:scale-105 delay-150 duration-500 outline-1 rounded outline-red-300 text-blue-600"
            onClick={openChainModal}
            type="button"
          >
            Open Chain Modal
          </button>
        )}
      </div>
    </div>
  );
};

export default YourApp;
