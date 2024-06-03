import { Address, BigInt, Bytes, bigInt } from "@graphprotocol/graph-ts";
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
} from "../generated/NftMarketplace/NftMarketplace";
import {
  ItemBought,
  ItemCanceled,
  ItemListed,
  ActiveItem,
} from "../generated/schema";

export function handleItemBought(event: ItemBoughtEvent): void {
  let entity = ItemBought.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!entity) {
    entity = new ItemBought(
      // event.transaction.hash.concatI32(event.logIndex.toI32())
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  entity.buyer = event.params.buyer;
  entity.nftAddress = event.params.nftAddress;
  entity.tokenId = event.params.tokenId;
  entity.price = event.params.price;

  activeItem!.buyer = event.params.buyer;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
  activeItem!.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let entity = ItemCanceled.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!entity) {
    entity = new ItemCanceled(
      // event.transaction.hash.concatI32(event.logIndex.toI32())
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  entity.seller = event.params.seller;
  entity.nftAddress = event.params.nftAddress;
  entity.tokenId = event.params.tokenId;

  activeItem!.buyer = Address.fromString(
    "0x000000000000000000000000000000000000dEaD"
  );

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
  activeItem!.save();
}

export function handleItemListed(event: ItemListedEvent): void {
  let entity = ItemListed.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!entity) {
    entity = new ItemListed(
      // event.transaction.hash.concatI32(event.logIndex.toI32())
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  if (!activeItem) {
    activeItem = new ActiveItem(
      // event.transaction.hash.concatI32(event.logIndex.toI32())
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  entity.seller = event.params.seller;
  entity.nftAddress = event.params.nftAddress;
  entity.tokenId = event.params.tokenId;
  entity.price = event.params.price;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  activeItem.seller = event.params.seller;
  activeItem.nftAddress = event.params.nftAddress;
  activeItem.tokenId = event.params.tokenId;
  activeItem.price = event.params.price;
  activeItem.buyer = Address.fromString(
    "0x0000000000000000000000000000000000000000"
  );
  // activeItem.buyer = Address.fromI32(0); // Don't Do This! Buyer will be 0x00000000.
  activeItem.blockNumber = event.block.number;
  activeItem.blockTimestamp = event.block.timestamp;
  activeItem.transactionHash = event.transaction.hash;

  entity.save();
  activeItem.save();
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): Bytes {
  // return Bytes.fromHexString(tokenId.toHexString()).concatI32(
  //   nftAddress.toI32()
  // ); // Don't Do This! Covert error.
  return nftAddress.concatI32(tokenId.toI32());
}
