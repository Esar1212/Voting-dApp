import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./VotingABI.json";
import { FaAccusoft, FaClipboardList } from "react-icons/fa";

export default function VotingLogs() {
  const [logs, setLogs] = useState([]);
  const contractAddress = "0x965300a7918847d74Bb31bf464F25684875dcc77";
  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  };
  
  useEffect(() => {
  const check = async () => {
    const contract = getContract();
    const addr = await window.ethereum.request({ method: "eth_requestAccounts" });
      const BlockBn = await contract.lastResetBlock();
      const fromBlock = BlockBn.toNumber();
      const logs = await contract.queryFilter("VoteCast",fromBlock);
      const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
          const block = await contract.provider.getBlock(log.blockNumber);
          return {
            voter: log.args.voter,
            candidate: log.args.candidate,
            timestamp: new Date(block.timestamp * 1000).toLocaleString(),
            blockNumber: log.blockNumber,
          };
        })
      );
      setLogs(enrichedLogs);
    }
  check();
}, []);


  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center flex items-center justify-center gap-2">
        <FaClipboardList className="inline text-blue-600" />
        Live Voting Logs
      </h2>
      <div className="flex flex-col gap-4">
        {logs.length === 0 && (
          <div className="text-center text-gray-500">No votes have been cast yet.</div>
        )}
        {logs.map((log) => (
          <div
            key={log.key}
            className="bg-white rounded-lg shadow-md border border-green-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between"
          >
            <div>
              <span className="font-semibold text-green-700">Voter:</span>
              <span className="ml-2 text-gray-700">{log.voter}</span>
              <div className="font-semibold text-green-700"> Candidate:
              <span className="ml-2 text-gray-700">{log.candidate}</span>
              </div>
              <div className="font-semibold text-green-700"> Block Number:
              <span className="ml-2 text-gray-700">{log.blockNumber}</span>
              </div>
              <div className="text-xs text-gray-400 mt-2 sm:mt-0 sm:ml-4">{log.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}