import React from 'react'
import '../styles/globals.css'
import type { AppProps } from 'next/app';
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

function _app({ Component, pageProps}: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
        <NotificationProvider>
            <Component {...pageProps} />
        </NotificationProvider>
    </MoralisProvider>
  )
}

export default _app