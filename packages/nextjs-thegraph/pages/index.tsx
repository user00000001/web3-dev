import type { NextPage } from "next";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useEffect, useState } from "react";
import NFTBox from "../components/NFTBox";
import networkMapping from "../constants/networkMapping.json";
import { useQuery, gql } from "@apollo/client";

const PAGE_SIZE = 9;

type NetworkConfigItem = {
  NftMarketplace: string[];
};

type NetworkConfigMap = {
  [chainId: string]: NetworkConfigItem;
};

const Home: NextPage = () => {
  // TODO: Implement paging in UI
  const [page, setPage] = useState(1);
  const { isWeb3Enabled, chainId } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "31337";
  const marketplaceAddress = (networkMapping as NetworkConfigMap)[chainString]
    .NftMarketplace[0];

  const {
    loading,
    error,
    data: listedNfts,
  } = useQuery(gql`
    {
      activeItems(
        first: 5
        where: { buyer: "0x0000000000000000000000000000000000000000" }
      ) {
        id
        buyer
        seller
        nftAddress
        tokenId
        price
      }
    }
  `);

  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          loading || !listedNfts ? (
            <div>Loading...</div>
          ) : (
            listedNfts.activeItems.map((nft: any /*, index*/) => {
              console.log(nft);
              const { price, nftAddress, tokenId, seller } = nft;

              return marketplaceAddress ? (
                <NFTBox
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  marketplaceAddress={marketplaceAddress}
                  seller={seller}
                  key={`${nftAddress}${tokenId}`}
                />
              ) : (
                <div>Network error, please switch to a supported network. </div>
              );
            })
          )
        ) : (
          <div>Web3 Currently Not Enabled </div>
        )}
      </div>
    </div>
  );
};
export default Home;
