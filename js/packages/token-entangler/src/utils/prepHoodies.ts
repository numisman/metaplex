const { Keypair, 
    Transaction,
    TransactionInstruction,
    SystemProgram,
    Connection,
    sendAndConfirmTransaction,
    PublicKey,
    LAMPORTS_PER_SOL } = require('@solana/web3.js');

const SOLANA_RPC_URI = 'https://api.devnet.solana.com';
const MEMO_PROGRAM_ID = 'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo';
const LAMPORT_COSTS = 1000000;
const WALLET_PUBLIC_KEY = 'CRYb5oxXarPywCN5jLVD6gj2QpxGynuHyrxYZentXJ8D';
const PROJECT_WALLET_PUBLIC_KEY = 'CRYb5oxXarPywCN5jLVD6gj2QpxGynuHyrxYZentXJ8D';

const testData = JSON.stringify({pandaId: "thisIsATestPandaId",
                                 dumpsterId: "thisIsATestDumpsterId",
                                 addressLine1: "555 Main Street",
                                 addressLine2: "P.O. Box 123",
                                 addressLine3: "Second Window On the Right",
                                 city: "Anywhere",
                                 state: "CO",
                                 postalCode: "80921",
                                 additionalInfo: "This is a free form text field for directions or other types of delivery information"});

const sendMemo = async (conn, account) => {
    const sendSolanaInstruction = SystemProgram.transfer(
        {
            fromPubkey: new PublicKey(account.publicKey),
            toPubkey: new PublicKey(account.publicKey),
            lamports: LAMPORT_COSTS
        }
    );
    const memoIx = new TransactionInstruction(
        {
            keys: [{
                pubkey: account.publicKey,
                isSigner: true,
                isWritable: true
            }],
            programId: new PublicKey(MEMO_PROGRAM_ID),
            data: Buffer.from(testData),
        }
    );

    const txn = new Transaction();
    txn.add(sendSolanaInstruction);
    txn.add(memoIx);

    return await sendAndConfirmTransaction(
        conn,
        txn,
        [account],
        {
            commitment: "confirmed",
        }
    );
};
(async () => {
    const conn = new Connection(SOLANA_RPC_URI);
    const account = new Keypair();
    const sig1 = await conn.requestAirdrop(account.publicKey, LAMPORTS_PER_SOL);
    await conn.confirmTransaction(sig1);
    console.log("airdrop done");
    console.log("account: ", account.publicKey.toBase58());
    const sig = await sendMemo(conn, account);
    console.log('sig: ', sig);
})().catch(console.error);
