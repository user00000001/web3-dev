import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Anchor01Favorites } from "../target/types/anchor01_favorites";
import { assert } from "chai";
import { BN } from "bn.js";
import { PublicKey } from "@solana/web3.js";

describe("anchor01_favorites", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .anchor01Favorites as Program<Anchor01Favorites>;
  const favorites = {
    "number": new BN(52),
    color: "blue",
    hobbies: ["swimming", "fighting", "boxing"],
  };
  const [favorites_account, favaorite_bump] = PublicKey.findProgramAddressSync([Buffer.from("favorites"), program.provider.publicKey.toBuffer()], program.programId);
 
  it("set the favorites, then check the favorites' number!", async () => {
    // Add your test here.
    const tx = await program.methods
      .setFavorites(favorites.number, favorites.color, favorites.hobbies)
      .rpc();
    console.log("Your transaction signature", tx);
    const favorites_fetch = await program.account.favorites.fetch(favorites_account);
    console.log(`${JSON.stringify(favorites_fetch)}`);
    assert(favorites.number.eq(favorites_fetch.number));
    //assert(favorites_fetch.color);
    //assert(favorites_fetch.hobbies);
  });
  it("check color!", async ()=>{
    const favorites_fetch = await program.account.favorites.fetch(favorites_account);
    assert(favorites.color == favorites_fetch.color);
  });
  it("check hobbies!", async ()=>{
    const favorites_fetch = await program.account.favorites.fetch(favorites_account);
    assert(favorites_fetch.hobbies.includes(favorites.hobbies[0]));
    assert(favorites_fetch.hobbies.includes(favorites.hobbies[1]));
    assert(favorites_fetch.hobbies.includes(favorites.hobbies[2]));
  });

});
