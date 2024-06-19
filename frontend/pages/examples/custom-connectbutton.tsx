import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import CustomNav from "./_components/CustomNav";
const YourApp = () => {
  return (
    <div>
      <CustomNav />
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== "loading";
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === "authenticated");
          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
              className=" mt-2 rounded-sm w-1/2 mx-auto flex justify-items-center bg-gray-300"
            >
              {(() => {
                if (!connected) {
                  return (
                    <button onClick={openConnectModal} type="button">
                      Connect Wallet
                    </button>
                  );
                }
                if (chain.unsupported) {
                  return (
                    <button onClick={openChainModal} type="button">
                      Wrong network
                    </button>
                  );
                }
                return (
                  <div className="flex w-full text-center gap-12 justify-evenly divide-x-8 divide-red-400 shadow-sm shadow-yellow-400">
                    <button
                      onClick={openChainModal}
                      type="button"
                      className=" flex justify-center items-center w-full"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: "hidden",
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <Image
                              alt={chain.name ?? "Chain icon"}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                              width={48}
                              height={48}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>
                    <button onClick={openAccountModal} type="button" className=" w-full bg-slate-500">
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ""}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
};

export default YourApp;
