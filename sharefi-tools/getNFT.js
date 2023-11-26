const ethers = require('ethers');
require('dotenv').config();
const nftABI = require('./abi-nft.json');
const tokenABI = require('./abi-token.json');

const providerOrigin = new ethers.JsonRpcProvider(process.env.RPC_URL);// https://arb1.arbitrum.io/rpc
const walletOrigin = new ethers.Wallet(process.env.P_KEY_BURN);// your private key 
const accountOrigin = walletOrigin.connect(providerOrigin);

//https://www.sharefi.xyz/
const NFTAddress = '0x17Eb03dfF0010c8470A935739e2DF229053e1A2a';
const TokenAddress = '0x32df4d7226d8466c74266926589366707144d6cc';

async function approve_burn() {
    const contract = new ethers.Contract(NFTAddress, nftABI, accountOrigin);
    const burnAmount = await contract.burning_amount();
    console.log("Need to burn ", ethers.formatUnits(burnAmount))

    // check approval
    const ok = await doApproval(burnAmount);
    if (ok) {
        const tx = await contract.burn_tokens(burnAmount);
        await tx.wait(1);
        console.log("Burn Result", tx)
    }
}

async function doApproval(_amount) {
    const tokenContract = new ethers.Contract(TokenAddress, tokenABI, accountOrigin);
    const allowanceAmount = await tokenContract.allowance(accountOrigin.address, NFTAddress);
    console.log("Contract Allowance: " + allowanceAmount.toString(), allowanceAmount);

    if (allowanceAmount.toString() == "0" || _amount.toString() >= allowanceAmount.toString()) {
        console.log("Contract Needs to Increase Allowance: ");
        const parse = await tokenContract.approve(NFTAddress, _amount);
        const receipt = await parse.wait(1);
        console.log("Approve Result: ", receipt);
    }
    return true;
}

async function run() {
    await approve_burn();
}

run();