import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import abi from "./VotingABI.json";

const contractAddress = "0x424a0db38421bed9838e45E957C6aF21c2748081";



function App() {
  const [options, setOptions] = useState([]);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [contract, setContract] = useState(null);
   const [winner, setWinner] = useState('');
  const [pollEnded, setPollEnded] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [restartPolling, setRestartVoting] = useState(false);

 
function parseEthersError(error) {
  // For Solidity `require` reverts with message
  if (error?.error?.message) {
    const parts = error.error.message.split('revert ');
    return parts[1] ? parts[1] : error.error.message;
  }

  // Ethers fallback error reason
  if (error?.reason) {
    return error.reason;
  }

  // Default fallback
  return "Transaction failed. Please check the console.";
}

  const handleVote = async(id) => {
    if (voted) return;
    const candidate = options.find(opt => opt.id === id);
    if (!candidate) return;

    try {
      setLoading(true);
  
      const tx = await contract.vote(candidate.name);
      await tx.wait(); // Wait for transaction to be mined

      setOptions(options.map(opt =>
        opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt
      ));
      setVoted(true);
    } catch (error) {
      const msg=parseEthersError(error);
      alert(`Error: ${msg}`);
      console.error('Voting failed:', error);
    
    } finally {
      setLoading(false);
    }
  };

  const handleEndPolling= async()=>{
    try{
      setRestartVoting(true);
      const tx= await contract.endVoting();
      await tx.wait();
      setPollEnded(true);
      alert("Polling ended successfully!");
    }catch(error){
      const msg=parseEthersError(error);
      alert(`Error: ${msg}`);
      console.error('Ending polling failed:', error);
    } finally {
      setRestartVoting(false);
    }
    };
    
   const handleDeclareWinner = async () => {
    try {
      setLoading(true);
      const winnerName = await contract.declareWinner();
      setWinner(winnerName);
    } catch (error) {
      const msg=parseEthersError(error);
      alert(`Error: ${msg}`);
      console.error('Declaring winner failed:', error);
    } finally {
      setLoading(false);
    }
  };
   const restartVoting = async() => {
    try{
      setLoading(true);
      const tx = await contract.resetVote();
      await tx.wait();
      setVoted(false);
      setWinner('');
      setPollEnded(false);
      setVoteCounts({});
    }catch(error){
      const msg=parseEthersError(error);
      alert(`Error: ${msg}`);
      console.error('Restarting voting failed:', error);  
    }finally{
      setLoading(false);
    }
   }
  

  const handleTotalVotes = async (candidateName) => {
    try {
      setLoading(true);
      const total = await contract.totalVotesFor(candidateName);
      setVoteCounts(prev => ({
        ...prev,
        [candidateName]: total.toString()
      }));
    } catch (error) {
      console.error('Fetching total votes failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
         const provider = new ethers.providers.Web3Provider(window.ethereum);
         const signer = provider.getSigner();
         console.log("using contract address:", contractAddress);
         console.log("Using signer address:", await signer.getAddress());  
    
         const contract = new ethers.Contract(contractAddress, abi, signer);
         console.log("Owner of the smart contract:", await contract.owner());

         setPollEnded(await contract.votingEnded());

         setCandidates(await contract.getAllCandidates());
  
         setContract(contract);
         setWalletConnected(true);


      } catch (error) {
        console.error('User rejected wallet connection:', error);
      } finally {
        setLoading(false);
      }
    } else {
      alert('MetaMask not detected. Please install MetaMask extension.');
    }
  };

  useEffect(()=>{
    if (candidates.length > 0) {
           const dynamicOptions = candidates.map((name, index) => ({
           id: index + 1,
            name,
           votes: 0
          }));
         setOptions(dynamicOptions);
       }
  },[candidates])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
      fontFamily: 'Segoe UI, Arial, sans-serif'
    }}>
      <div style={{
        width: 420,
        padding: 32,
        borderRadius: 16,
        background: '#fff',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        border: '1px solid #e3e3e3'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: 32,
          color: '#1976d2',
          letterSpacing: 1.5
        }}>🗳️ Decentralized Voting App</h2>

        {/* Connect Wallet Button */}
        {!walletConnected && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <button
              onClick={connectWallet}
              style={{
                padding: '12px 32px',
                borderRadius: 8,
                background: '#ff9800',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold',
                fontSize: 17,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(255,152,0,0.12)',
                letterSpacing: 1,
                transition: 'background 0.2s'
              }}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect your MetaMask Wallet Account'}
            </button>
          </div>
        )}

        {walletConnected && (
          <div style={{
            textAlign: 'center',
            marginBottom: 18,
            color: '#388e3c',
            fontWeight: 500,
            fontSize: 15,
            wordBreak: 'break-all'
          }}>
            Connected: {account}
          </div>
        )}

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {options.map(option => (
            <li key={option.id} style={{
              margin: '18px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f7fafd',
              borderRadius: 8,
              padding: '12px 18px',
              boxShadow: '0 1px 4px rgba(31, 38, 135, 0.06)'
            }}>
              <span style={{ fontWeight: 500, fontSize: 17, color: '#333' }}>{option.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => handleVote(option.id)}
                  disabled={voted || loading || pollEnded || !walletConnected}
                  style={{
                    padding: '7px 18px',
                    borderRadius: 6,
                    background: voted || pollEnded || !walletConnected ? '#bdbdbd' : '#1976d2',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: voted || loading || pollEnded || !walletConnected ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  Vote
                </button>
                <button
                  onClick={() => handleTotalVotes(option.name)}
                  disabled={loading}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 6,
                    background: '#43a047',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  Total Votes
                </button>
                <span style={{
                  marginLeft: 6,
                  fontSize: 15,
                  color: '#1976d2',
                  fontWeight: 500
                }}>
                  {voteCounts[option.name] !== undefined
                    ? `Total: ${voteCounts[option.name]}`
                    : ''}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginTop: 36
        }}>
          <button
            onClick={handleEndPolling}
            disabled={pollEnded || loading || !walletConnected}
            style={{
              padding: '12px 28px',
              borderRadius: 8,
              background: pollEnded || !walletConnected ? '#bdbdbd' : '#d32f2f',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              fontSize: 16,
              cursor: pollEnded || loading || !walletConnected ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 4px rgba(211,47,47,0.08)',
              transition: 'background 0.2s'
            }}
          >
            End Polling
          </button>
          <button
            onClick={handleDeclareWinner}
            disabled={!pollEnded || loading || !walletConnected}
            style={{
              padding: '12px 28px',
              borderRadius: 8,
              background: !pollEnded || !walletConnected ? '#bdbdbd' : '#fbc02d',
              color: !pollEnded || !walletConnected ? '#fff' : '#333',
              border: 'none',
              fontWeight: 'bold',
              fontSize: 16,
              cursor: !pollEnded || loading || !walletConnected ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 4px rgba(251,192,45,0.08)',
              transition: 'background 0.2s'
            }}
          >
            Declare Winner
          </button>
        </div>
        {voted && (
          <div style={{
            color: '#43a047',
            textAlign: 'center',
            marginTop: 24,
            fontWeight: 500,
            fontSize: 16
          }}>
            Thank you for voting!
          </div>
        )}
        {loading && (
          <div style={{
            color: '#1976d2',
            textAlign: 'center',
            marginTop: 16,
            fontWeight: 500,
            fontSize: 15
          }}>
            Processing...
          </div>
        )}
        {pollEnded && (
          <div style={{
            color: '#d32f2f',
            textAlign: 'center',
            marginTop: 16,
            fontWeight: 500,
            fontSize: 15
          }}>
            Polling has ended.
          </div>
        )}
        {winner && (
          <div style={{
            color: '#388e3c',
            textAlign: 'center',
            marginTop: 28,
            fontWeight: 'bold',
            fontSize: 20,
            letterSpacing: 1
          }}>
            🏆 Winner: {winner}
          </div>
        )}

        {/* Restart Voting Button INSIDE CARD, STICKY TO BOTTOM */}
        {walletConnected && pollEnded && (
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              left: 0,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.97)',
              padding: '18px 0 10px 0',
              zIndex: 10,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              boxSizing: 'border-box',
              marginTop: 32
            }}
          >
            <button
              onClick={restartVoting}
              disabled={loading}
              style={{
                padding: '14px 38px',
                borderRadius: 10,
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold',
                fontSize: 18,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 12px rgba(25, 118, 210, 0.13)',
                letterSpacing: 1.2,
                transition: 'background 0.2s'
              }}
            >
              {restartPolling ? 'Restarting...' : 'Restart Voting'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


export default App;
