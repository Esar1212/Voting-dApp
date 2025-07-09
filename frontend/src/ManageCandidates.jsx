import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./VotingABI.json";
import { FaUserTie, FaPlus, FaClipboardCheck } from "react-icons/fa";

const contractAddress = "0x965300a7918847d74Bb31bf464F25684875dcc77";

export default function ManageCandidates() {
  const [numCandidates, setNumCandidates] = useState(2);
  const [candidateList, setCandidateList] = useState([""]);
  const [candidatesAdded, setCandidatesAdded] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [showEndVoting, setShowEndVoting] = useState(false);
  const [showRestartVoting, setShowRestartVoting] = useState(false);

  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  };

  const fetchCandidates = async () => {
    try {
      const contract = getContract();
      const all = await contract.getAllCandidates();
      const votesArr = await Promise.all(all.map(candidate => contract.totalVotesFor(candidate)));
      const list = all.map((candidate, idx) => ({
        name: candidate,
        votes: votesArr[idx].toNumber(),
      }));
      setCandidates(list);
    } catch (err) {
      console.error("❌ Error fetching candidates:", err);
    }
  };

  // Handle change in number of candidates
  const handleNumCandidatesChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setNumCandidates(value);
    setCandidateList((prev) => {
      const updated = [...prev];
      if (value > prev.length) {
        // Add empty slots
        return [...updated, ...Array(value - prev.length).fill("")];
      } else {
        // Remove extra slots
        return updated.slice(0, value);
      }
    });
  };

  // Handle change in candidate name at index
  const handleCandidateNameChange = (idx, value) => {
    setCandidateList((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  // Add all candidates from the list
  const handleAddCandidates = async () => {
    const names = candidateList.map(name => name.trim()).filter(Boolean);
    if (names.length !== numCandidates) {
      return alert("Please fill all candidate names.");
    }
    try {
      const contract = getContract();
        const tx = await contract.addMultipleCandidates(numCandidates, candidateList);
        await tx.wait();
      alert(`✅ Added ${names.length} candidates and started voting!`);
      setCandidateList(Array(numCandidates).fill(""));
      setShowEndVoting(true);
      setCandidatesAdded(true);
      fetchCandidates();
    } catch (err) {
      alert("❌ Error adding candidates: " + err.message);
    }
  };
  useEffect(() => {
    fetchCandidates();
   
  }, [candidates]);
  useEffect(() => {
  const checkVotingStatus = async () => {
    const contract = getContract();
    const isVotingEnded = await contract.votingEnded();
    if (candidates.length > 0 && !isVotingEnded) {
      setShowEndVoting(true);
      setCandidatesAdded(true);
      setShowRestartVoting(false);
    } else if (isVotingEnded) {
      setShowEndVoting(false);
      setCandidatesAdded(true);
      setShowRestartVoting(true);
    } else {
      setShowEndVoting(false);
      setCandidatesAdded(false);
      setShowRestartVoting(false);
    }
  };
  checkVotingStatus();
}, [candidates]);
  return (
    <div className="flex flex-col rounded-lg p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-black">
        <FaUserTie className="inline mr-1" /> Manage Candidates
      </h2>

      {!candidatesAdded && (<div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <label className="font-semibold text-black">Number of Candidates:</label>
          <input
            type="number"
            min = "2"
            className="border p-2 rounded w-24 text-black"
            value={numCandidates}
            onChange={handleNumCandidatesChange}
            onWheel={e=> e.target.blur()} // Disable scroll changing the value
          />
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {Array.from({ length: numCandidates }).map((_, idx) => (
            <input
              key={idx}
              type="text"
              className="border p-2 rounded w-64 text-black"
              placeholder={`Candidate ${idx + 1} name`}
              value={candidateList[idx] || ""}
              onChange={e => handleCandidateNameChange(idx, e.target.value)}
            />
          ))}
        </div>
        <button
          onClick={handleAddCandidates}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2 w-fit"
        >
          <FaPlus className="inline mr-1" /> Add All and Start Voting
        </button>
      </div>)}

      <h3 className="text-lg font-semibold text-black mb-2">
        <FaClipboardCheck className="inline mr-1" />Registered Candidates:
      </h3>
      <ul className="bg-white text-black shadow rounded p-4 space-y-2">
        {candidates.length === 0 ? (
          <li className="text-gray-500">No candidates registered yet.</li>
        ) : (
          candidates.map((c, i) => (
            <li key={i} className="flex justify-between border-b pb-2">
              <span>
                {i + 1}. {c.name} — 🗳 {c.votes} votes
              </span>
            </li>
          ))
        )}
      </ul>
      {showEndVoting && (<button
        onClick={async () => {
          const contract = getContract();
          try {
            const tx = await contract.endVoting();
            await tx.wait();
            alert("✅ Voting ended successfully!");
            setShowEndVoting(false);
            setShowRestartVoting(true);
          } catch (err) {
            alert("❌ Error ending voting: " + err.message);
          }
        }}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-800 mt-4 w-fit">
        End Voting
      </button>
      )}
      {showRestartVoting && (<button
        onClick={async () => {
          const contract = getContract();
          try {
            const tx = await contract.resetVote();
            await tx.wait();
            alert("Candidate list reset!");
            setShowRestartVoting(false);
            setCandidateList([""]);
            setCandidates([]);
            setNumCandidates(2);
            fetchCandidates();
          } catch (err) {
            alert("❌ Error restarting voting: " + err.message);
          }
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4 w-fit">
        Reset Candidate List
      </button>
      )}
    </div>
  );
}
