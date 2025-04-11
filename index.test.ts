import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { COUNTER_SIZE, CounterAccount } from "./types";
import { schema } from "./types";
let adminAccount = Keypair.generate();
let dataAccount = Keypair.generate();
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const programId = "9cJZhSHg4eLiQcKwaeTzxTvFF9iNgKj8uixqAvcUFgXw";
import * as borsh from "borsh";
const lamports = await connection.getMinimumBalanceForRentExemption(
  COUNTER_SIZE
);
test("Admin air drop", async () => {
  const txn = await connection.requestAirdrop(
    adminAccount.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(txn);
  const data = await connection.getAccountInfo(adminAccount.publicKey);
  expect(data?.lamports).toBe(2 * LAMPORTS_PER_SOL);
});
test("Account initialization", async () => {
  const atxn = SystemProgram.createAccount({
    fromPubkey: adminAccount.publicKey,
    lamports,
    space: COUNTER_SIZE,
    programId: new PublicKey(programId),
    newAccountPubkey: dataAccount.publicKey,
  });
  const transaction = new Transaction();
  transaction.add(atxn);
  const signature = await connection.sendTransaction(transaction, [
    adminAccount,
    dataAccount,
  ]);
  await connection.confirmTransaction(signature);
  console.log(dataAccount.publicKey.toBase58());
});
test("Initial counter", async () => {
  const counterAccount = await connection.getAccountInfo(dataAccount.publicKey);
  if (!counterAccount) throw new Error("Account not found");
  const counter = borsh.deserialize(
    schema,
    counterAccount.data
  ) as CounterAccount;
  expect(counter.count).toBe(0);
});
test("", async () => {});
