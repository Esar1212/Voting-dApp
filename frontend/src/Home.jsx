import React from "react";
import { Link,useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import abi from './VotingABI.json';
import { useEffect, useState } from "react";
import VotingChart from "./Dashboard";

export default function Home() {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [walletConnected, setWalletConnected] = useState(false);
    const contractAddress =  "0x965300a7918847d74Bb31bf464F25684875dcc77"
    const [data, setData] = useState([]);
    const [isVoteEnded, setIsVoteEnded] = useState(false);
    const navigate= useNavigate();

  
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
     if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);
            const candidateList = await contract.getAllCandidates();
            setCandidates(candidateList);
            setContract(contract);
          setWalletConnected(true);
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    } else {
      console.log("MetaMask is not installed");
    }
  };

  checkIfWalletIsConnected();
  }, []);
  useEffect(() => {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setWalletConnected(true);
      } else {
        setAccount(null);
        setWalletConnected(false);
      }
    });
  }
}, []);


 useEffect(() => {
  if (!contract) return;
  const handler = () => setIsVoteEnded(true);
  contract.on("VotingEnded", handler);
  return () => {
    contract.off("VotingEnded", handler);
  };
}, [contract]);

useEffect(() => {
  const checkVotingStatus = async () => {
    if (contract) {
      try {
        const ended = await contract.votingEnded();
        setIsVoteEnded(ended);
      } catch (err) {
        console.error("Error checking voting status:", err);
      }
    }
  };
  checkVotingStatus();
}, [contract]);

useEffect(() => {
  if (!contract) return;
  const handler = (candidates) => {
    setCandidates(candidates);
  };
  contract.on("AddCandidates", handler);
  return () => {
    contract.off("AddCandidates", handler);
  };
}, [contract]);

useEffect(() => {
  if (!contract) return;
  const handler = () => {
    setCandidates([]);
  };
  contract.on("RemoveCandidates", handler);
  return () => {
    contract.off("RemoveCandidates", handler);
  };
}, [contract]);

    const connectWallet = async () => {
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);
            const candidateList = await contract.getAllCandidates();
            setCandidates(candidateList);
            setContract(contract);
            setWalletConnected(true);
          } catch (error) {
            console.error('User rejected wallet connection:', error)
          }
        } else {
          alert('MetaMask not detected. Please install MetaMask extension.');
        }
      };

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hero Section */}
      <section className="bg-[url('https://imgs.search.brave.com/Ptrk0TF7TxXPNEqZ8zBcM3YeJ9iAjfmG5SsG60d1qH8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMDcv/MDAxLzQxOS9zbWFs/bC8zZC1yZW5kZXIt/ZXRoZXJldW0tZm9y/LWNyeXB0b2N1cnJl/bmN5LW9uLWZ1dHVy/ZS1ibHVlLWJhY2tn/cm91bmQtcGhvdG8u/anBn')] bg-cover bg-center text-white relative flex-1">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
            Power to the People.<br />
            <span className="text-blue-400">Vote Transparently on the Blockchain.</span>
          </h2>
          <p className="text-lg mt-4 max-w-xl mx-auto">
            Experience decentralized, tamper-proof, real-time elections using smart contracts and Web3.
          </p>
          {!isVoteEnded && candidates.length > 0 && (
          <div className="mt-8 space-x-4">
            <button onClick={()=>{if(walletConnected)
                                  navigate("/vote");
                                else
                                  alert("Please connect your wallet account first.");
            }} className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded shadow text-white font-medium">Start Voting</button>
            
          </div>
          )}
        </div>
      

      {/* Candidate Names Section */}
      {walletConnected && !isVoteEnded && (
        <section
          className="relative py-10 px-2 text-center flex justify-center items-center min-h-[400px] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1518544801346-3df1c2b1b2c7?auto=format&fit=crop&w=900&q=80')"
          }}
        >
          <div className="relative z-10 w-full max-w-2xl mx-auto rounded-xl p-8 bg-white/90 shadow-2xl border border-blue-200">
            <h1 className="text-2xl font-extrabold text-blue-900 mb-4 drop-shadow-lg">Your MetaMask Wallet is Connected</h1>
            <p className="text-gray-800 mb-2">
              Connected Account: <span className="font-semibold">{account}</span>
            </p>
            <p className="text-gray-800 mb-6">
              Total Candidates: <span className="font-semibold">{candidates.length}</span>
            </p>
            {candidates.length > 0 && (
            <p className="text-gray-800 mb-6">You can now vote for your favorite candidate.</p>
            )}
            <div className="bg-blue-50 bg-opacity-90 py-8 px-4 text-center shadow-inner rounded-xl border border-blue-100">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Candidates</h3>
              <ul className="flex flex-wrap justify-center gap-4">
                {candidates.map((name, idx) => (
                  <li
                    key={idx}
                    className="px-6 py-3 rounded-lg bg-blue-100 text-blue-800 font-semibold text-lg shadow hover:bg-blue-200 transition"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Connect Wallet Button - MetaMask */}
      {!walletConnected && (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <button
          className="mt-8 px-8 py-3 rounded-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold text-lg shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105 hover:from-yellow-500 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          onClick={connectWallet}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318.6 318.6" className="w-6 h-6"><g><polygon fill="#E2761B" points="274.1,35.5 174.8,109.6 193.2,67.7"/><polygon fill="#E4761B" points="44.5,35.5 124.9,68 143.2,109.6"/><polygon fill="#D7C1B3" points="238.2,229.6 206.2,254.7 232.7,262.2 240.1,230.2"/><polygon fill="#D7C1B3" points="78.5,229.6 78.4,262.2 104.9,254.7 72.9,229.6"/><polygon fill="#EA8D3A" points="133.1,146.7 127.1,156.5 191.2,156.5 185.2,146.7 159.2,164.8"/><polygon fill="#EA8D3A" points="104.9,254.7 133.1,241.2 110.7,224.1"/><polygon fill="#EA8D3A" points="185.5,241.2 213.7,254.7 208.9,224.1"/><polygon fill="#F6851B" points="206.2,254.7 185.5,241.2 159.2,259.7 133.1,241.2 104.9,254.7 132.7,262.2 159.2,270.6 185.7,262.2"/><polygon fill="#C0AD9E" points="159.2,259.7 185.5,241.2 185.7,262.2"/><polygon fill="#C0AD9E" points="159.2,259.7 132.7,262.2 133.1,241.2"/><polygon fill="#161616" points="132.7,262.2 104.9,254.7 110.7,224.1"/><polygon fill="#161616" points="213.7,254.7 185.7,262.2 208.9,224.1"/><polygon fill="#763D16" points="185.5,241.2 208.9,224.1 185.2,146.7"/><polygon fill="#763D16" points="133.1,241.2 110.7,224.1 133.1,146.7"/><polygon fill="#F6851B" points="110.7,224.1 133.1,146.7 159.2,164.8 185.2,146.7 208.9,224.1 185.5,241.2 159.2,259.7 133.1,241.2"/><polygon fill="#E4761B" points="193.2,67.7 174.8,109.6 185.2,146.7 208.9,224.1 213.7,254.7 232.7,262.2 240.1,230.2 238.2,229.6 206.2,254.7"/><polygon fill="#E4761B" points="143.2,109.6 124.9,68 104.9,254.7 72.9,229.6 78.5,229.6 104.9,254.7 133.1,241.2 110.7,224.1 143.2,109.6"/><polygon fill="#763D16" points="159.2,164.8 133.1,146.7 143.2,109.6 174.8,109.6 185.2,146.7"/><polygon fill="#F6851B" points="143.2,109.6 133.1,146.7 159.2,164.8 185.2,146.7 174.8,109.6"/><polygon fill="#E2761B" points="44.5,35.5 143.2,109.6 124.9,68"/><polygon fill="#E4761B" points="274.1,35.5 193.2,67.7 174.8,109.6"/><polygon fill="#763D16" points="159.2,164.8 185.2,146.7 174.8,109.6 143.2,109.6 133.1,146.7"/><polygon fill="#763D16" points="159.2,164.8 133.1,146.7 143.2,109.6 174.8,109.6 185.2,146.7"/></g></svg>
          Connect to MetaMask on Sepolia Network
        </button>
      </div>
      )}      
  
        {isVoteEnded && (
          <section className="relative py-10 px-2 text-center flex flex-col justify-center items-center ">
      <h1 className="text-3xl font-bold text-center text-white drop-shadow-lg">
        Voting has ended!
      </h1>
      <p className="text-center text-white mb-6">
        Thank you for participating! The results are announced below.
      </p>
      <VotingChart />
        </section>
        )}
  </section>
{/* Optional Ads / Announcements Section */}
      {!isVoteEnded && (
      <section className="bg-gray-100 py-6 px-4 text-center">
        <h3 className="text-xl font-semibold">📢 Announcement</h3>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Polling closes on <strong>28th October, 2025</strong>. Results will be declared on-chain.
        </p>
      </section>
      )}

    </div>
  );
}
