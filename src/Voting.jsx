import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import abi from "./VotingABI.json";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const contractAddress = "0x965300a7918847d74Bb31bf464F25684875dcc77";

function Voting() {
  const [options, setOptions] = useState([]);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [contract, setContract] = useState(null);
  const [winner, setWinner] = useState('');
  const [pollEnded, setPollEnded] = useState(false);
  const [account, setAccount] = useState('');
  const [restartPolling, setRestartVoting] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
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
          } catch (error) {
            console.error('User rejected wallet connection:', error)
          }
        } else {
          alert('MetaMask not detected. Please install MetaMask extension.');
        }
      };
    connectWallet();
  },[]);
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


  function parseEthersError(error) {
    if (error?.error?.message) {
      const parts = error.error.message.split('revert ');
      return parts[1] ? parts[1] : error.error.message;
    }
    if (error?.reason) {
      return error.reason;
    }
    return "Transaction failed. Please check the console.";
  }

 const handleVote = async (id) => {
    const candidate = options.find(opt => opt.id === id);
  if (!candidate || !contract) return;
  try {
    setLoading(true);
    const tx = await contract.vote(candidate.name);
    await tx.wait();
    setVoted(true);
    alert(`You voted for ${candidate.name}!`);
  }catch (error) {
    const msg = parseEthersError(error);
    alert(`Error: ${msg}`);
    console.error('Voting failed:', error);
  } finally {
    setLoading(false);
  }
};

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        setPollEnded(await contract.votingEnded());
        setCandidates(await contract.getAllCandidates());
        setContract(contract);
      } catch (error) {
        console.error('User rejected wallet connection:', error);
      } finally {
        setLoading(false);
      }
    } else {
      alert('MetaMask not detected. Please install MetaMask extension.');
    }
  };

  useEffect(() => {
    if (candidates.length > 0) {
      const dynamicOptions = candidates.map((name, index) => ({
        id: index + 1,
        name,
        votes: 0
      }));
      setOptions(dynamicOptions);
    }
  }, [candidates]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden">
      {/* Background image and overlay */}
      <div className="fixed inset-0 -z-10">
        <img
          src="https://imgs.search.brave.com/X_fJo3-8GogdW_mc2RSyp8Cuk-d72pl721INf9xqlOE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTM3/MjY0MTI3NC9waG90/by9hLXJvdy1vZi12/b3RpbmctYm9vdGhz/LXJlYWR5LWZvci1l/bGVjdGlvbi1kYXku/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PXZQcjhQUE9DN21K/OWlMSk5ScXI1XzFM/aDVOT014QTMtSjV1/QjJldVQ2N289"
          alt="Voting background"
          className="w-screen h-screen object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      </div>

      <div className="w-full max-w-md min-h-screen flex flex-col justify-center p-8 rounded-none md:rounded-2xl bg-white bg-opacity-95 shadow-2xl border border-gray-200 relative z-10">
        <h2 className="text-center mb-8 text-black-700 tracking-wider text-2xl font-bold flex items-center justify-center gap-2">
          <span role="img">🗳️</span> Decentralized Voting App
        </h2>

       

          <div className="text-center mb-4 text-green-700 font-medium text-base break-all">
            Connected Wallet Account: {account}
          </div>

        <ul className="list-none p-0 m-0 flex-1">
          {options.map(option => (
            <li key={option.id} className="my-4 flex justify-between items-center bg-blue-50 rounded-lg px-5 py-3 shadow-sm">
              <span className="font-medium text-lg text-gray-800">{option.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote(option.id)}
                  disabled={loading || pollEnded}
                  className={`px-4 py-2 rounded-md font-medium text-base transition-colors ${
                    pollEnded || loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-800 cursor-pointer'
                  } text-white`}
                >
                  Vote
                </button>
               
                <span className="ml-2 text-blue-700 font-medium text-base">
                  {voteCounts[option.name] !== undefined
                    ? `Total: ${voteCounts[option.name]}`
                    : ''}
                </span>
              </div>
            </li>
          ))}
        </ul>


        {voted && (
          <div className="text-green-700 text-center mt-6 font-medium text-base">
            Thank you for voting!
            <button onClick={()=>navigate('/')} className="ml-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md font-medium transition-colors">
              Go to Home
            </button>
          </div>
        )}
        {loading && (
          <div className="text-blue-700 text-center mt-4 font-medium text-base">
            Processing...
          </div>
        )}
        {pollEnded && (
          <div className="text-red-700 text-center mt-4 font-medium text-base">
            Polling has ended.
          </div>
        )}
        {winner && (
          <div className="text-green-800 text-center mt-7 font-bold text-xl tracking-wide">
            🏆 Winner: {winner}
          </div>
        )}

      </div>
    </div>
  );
}

export default Voting;