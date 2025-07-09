import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./VotingABI.json";
import VotingChart from "./Dashboard";
import VotingLogs from "./VotingLogs";
import ManageCandidates from "./ManageCandidates";
import { FaChartBar, FaUserTie, FaUsers, FaClipboardList, FaCog, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function AdminDashboardWithSidebar() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [voteData, setVoteData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const contractAddress = "0x965300a7918847d74Bb31bf464F25684875dcc77";

  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  };

  const fetchVotes = async () => {
    const contract = getContract();
    const candidates = await contract.getAllCandidates();
    const data = await Promise.all(
      candidates.map(async (c) => ({
        name: c.name,
        votes: (await contract.totalVotesFor(c.name)).toNumber(),
      }))
    );
    setVoteData(data);
  };

  const handleEndPoll = async () => {
    const contract = getContract();
    await contract.endPoll();
    alert("🛑 Poll ended successfully.");
  };

  const handleDeclareWinner = async () => {
    const contract = getContract();
    const winner = await contract.declareWinner();
    alert(`🏆 Winner is: ${winner}`);
  };

  useEffect(() => {
    async function check() {
      const contract = getContract();
      const addr = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(addr[0]);
      if ((await contract.owner()).toLowerCase() === addr[0].toLowerCase()) setIsAdmin(true);
    }
    check();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // Re-check admin status
          const contract = getContract();
          const owner = (await contract.owner()).toLowerCase();
          setIsAdmin(owner === accounts[0].toLowerCase());
        } else {
          setAccount(null);
          setIsAdmin(false);
        }
      });
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <VotingChart />;
      case "candidates":
        return <ManageCandidates/>;
      case "voters":
        return ;
      case "logs":
        return <VotingLogs/>;
      case "settings":
        return <p><FaCog className="inline mr-2" />Admin Settings — Coming soon...</p>;
      default:
        return <p>Welcome, Admin!</p>;
    }
  };

  if (!isAdmin) {
    return <p className="text-red-500 p-4">⛔ Access denied. Admins only.</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <div className={`relative transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0`}>
        <aside
          className={`
            h-screen bg-gradient-to-b from-green-700 via-green-600 to-green-800 shadow-2xl
            ${sidebarOpen ? "w-64 p-6" : "w-16 p-2"}
            flex flex-col items-center transition-all duration-300
            border-r-2 border-green-900
          `}
        >
          <button
            className="absolute top-4 -right-4 bg-green-800 hover:bg-green-900 text-white rounded-full p-1 shadow-lg focus:outline-none transition"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            style={{ zIndex: 10 }}
          >
            {sidebarOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
          </button>
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-10 mt-2">
              <FaCog className="text-white text-3xl" />
              {sidebarOpen && (
                <span className="text-2xl font-bold text-white tracking-wide">Admin Panel</span>
              )}
            </div>
            <nav className="flex flex-col gap-2 w-full">
              {[
                ["dashboard", "Voting Analytics", <FaChartBar className="inline mr-2" />],
                ["candidates", "Manage Candidates", <FaUserTie className="inline mr-2" />],
                ["voters", "Manage Voters", <FaUsers className="inline mr-2" />],
                ["logs", "Logs", <FaClipboardList className="inline mr-2" />],
                ["settings", "Settings", <FaCog className="inline mr-2" />],
              ].map(([key, label, icon]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`
                    flex items-center gap-2 w-full px-3 py-2 rounded-lg
                    transition
                    ${activeTab === key
                      ? "bg-green-900 text-white font-semibold shadow"
                      : "text-green-100 hover:bg-green-700 hover:text-white"}
                    ${!sidebarOpen ? "justify-center px-0" : ""}
                  `}
                  title={label}
                >
                  {icon}
                  {sidebarOpen && <span>{label}</span>}
                </button>
              ))}
            </nav>
          </div>
          {/* Optional: Account info at the bottom */}
          {sidebarOpen && (
            <div className="mt-auto w-full text-xs text-green-100 border-t border-green-800 pt-4 text-center">
              <div className="truncate">
                <span className="font-semibold">Account:</span>
                <br />
                {account ? (
                  <span title={account}>{account.slice(0, 6)}...{account.slice(-4)}</span>
                ) : (
                  <span>Not connected</span>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Main Content */}
      <main className="bg-[url('https://imgs.search.brave.com/TOZliv0BiRmNmbgMC7zyVDBSXjph4VsKdI26IAm8BcI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YnJpdGFubmljYS5j/b20vNjgvMjM1NzY4/LTA1MC0yNDgyRjlC/NS9UaHJlZS1kaWFn/b25hbC1kaWdpdGFs/LWNoYWlucy1vbi1h/LWJsdWUtYmFja2dy/b3VuZC5qcGc_dz0z/ODU')] bg-cover bg-center bg-indigo-100 text-white relative p-6 flex-1 inset-0 transition-all duration-300">
        {renderContent()}
      </main>
    </div>
  );
}