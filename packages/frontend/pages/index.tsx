import React from 'react';
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import ManualHeader from "../components/ManualHeader";
import LotteryEntrance from "../components/LotteryEntrance";

function Home() {
  return (
    <div className={styles.container}>
        <Head>
            <title>Smart Contract Lottery</title>
            <meta name='description' content='Our Smart Contract Lottery' />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Header></Header>
        {/* <ManualHeader></ManualHeader> */}
        <LotteryEntrance></LotteryEntrance>
    </div>
  )
}

export default Home