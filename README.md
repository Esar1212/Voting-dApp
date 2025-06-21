# 🗳️ Decentralized Voting DApp

A fully-functional decentralized voting application built with **Solidity**, **React**, **Ethers.js**, and **MetaMask** on the **Ethereum Sepolia testnet**. This project allows users to vote securely and transparently on-chain while ensuring only one vote per person, and owner-only control over poll resets.

---

## 🔗 Live Demo

> 🔴 https://stellular-sprite-7a20fb.netlify.app/ 

---

## 📸 Recording

https://github.com/user-attachments/assets/d657f82a-9dfb-4f90-add5-8e1df0812d55

---


## 🧩 Tech Stack

| Layer        | Tech Used                 |
|--------------|---------------------------|
| Smart Contract | Solidity, Remix IDE |
| Frontend     | React, Vite, Ethers.js    |
| Wallet       | MetaMask (Web3 wallet)    |
| Blockchain   | Ethereum (Sepolia Testnet)|
| Hosting      | [Optional: Vercel/Fleek]  |

---

## 🚀 Features

- 🔐 **One-vote-per-wallet** enforcement using `mapping(address => bool)`
- 📜 **Only owner can reset voting** via Solidity `modifier`
- 🧾 **Voting logic stored on-chain** (vote count, voter tracking)
- 🧠 **Smart contract interaction** using `ethers.js`
- 🦊 **MetaMask integration** for secure user authentication
- 📈 **Real-time candidate listing and vote count display**
- ⚠️ **Error handling** with smart contract `require` messages on frontend

---

## 🧪 How to Run Locally

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/dvoting-dapp.git
cd dvoting-dapp
