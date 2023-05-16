const { task } = require("hardhat/config");
require("dotenv").config()
const { task } = require("hardhat/config");
const { getSigners, sleep } = require("./libs")
const axios = require("axios")
const { swap } = require("./uni/univ3")
require("dotenv").config()
const ethers = require("ethers");

abi = [{
  "inputs": [
    {
      "type": "address"
    },
    {
      "name": "signature",
      "type": "uint256"
    },
    {
      "name": "",
      "type": "uint256"
    },
    {
      "name": "",
      "type": "uint256"
    },
    {
      "name": "",
      "type": "uint8"
    },
    {
      "name": "",
      "type": "bytes32"
    },
    {
      "name": "",
      "type": "bytes32"
    }
  ],
  "name": "claim",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}]
addr = "0x9aA48260Dc222Ca19bdD1E964857f6a2015f4078"

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
async function claim(signer) {
  try {
    const response = await axios.post(`https://zksync-ape-apis.zkape.io/airdrop/index/getcertificate`, {
      address: signer.address,
    });
    const { deadline, nonce, owner, r, s, v, value } = response.data.Data
    console.log(response.data.Data)
    if (value === "0") {
      console.log(`%s has no airdrop`, signer.address)
      return
    }
    const airdrop = new ethers.Contract(addr, abi, signer)
    let tx = await airdrop.claim(
      owner,
      value,
      nonce,
      deadline,
      v,
      r,
      s,
      { gasLimit: 1920083, gasPrice: ethers.utils.parseUnits("0.25", "gwei") }
    )
    await tx.wait()
    console.log(`%s claim %s`, signer.address, tx.hash)
    return
  } catch (error) {
    console.log(signer.address, error)
    return
  }
}


const {PRIVATE_KEYS} = process.env

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("claim", "", async (taskArgs, hre) => {
    const provider = new hre.ethers.providers.JsonRpcProvider("https://mainnet.era.zksync.io")

    let tasks = []
    for (let key of PRIVATE_KEYS.split(",")) {
        const signer = new hre.ethers.Wallet(key, provider)
        tasks.push(claim(signer))
    }
    await Promise.all(tasks)
})
