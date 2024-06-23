import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";

import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import {
  RainbowKitProvider,
  darkTheme,
  midnightTheme,
  Locale,
} from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";

import config, {
  hardhat_node,
  client,
  getSiweMessageOptions
} from "./_config";

function MyApp({ Component, pageProps }: AppProps<{ session: Session }>) {
  const { locale } = useRouter() as { locale: Locale };
  return (
    <WagmiProvider config={config}>
      <SessionProvider
        basePath="/frontend/api/auth"
        baseUrl="http://192.168.0.99:3000"
        refetchInterval={0}
        session={pageProps.session}
      >
        {/* <PersistQueryClientProvider
          client={client}
          persistOptions={{ persister }}
        > */}
          <QueryClientProvider client={client}>
          <RainbowKitSiweNextAuthProvider
            getSiweMessageOptions={getSiweMessageOptions}
          >
            <RainbowKitProvider
              modalSize="wide"
              coolMode
              locale={locale}
              initialChain={hardhat_node}
              theme={darkTheme({
                ...midnightTheme.accentColors.blue,
                accentColor: "#7b3fe4",
                accentColorForeground: "white",
                borderRadius: "small",
                fontStack: "system",
                overlayBlur: "small",
              })}
            >
              <Component {...pageProps} />
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
          </QueryClientProvider>
        {/* </PersistQueryClientProvider> */}
      </SessionProvider>
    </WagmiProvider>
  );
}

export default MyApp;
