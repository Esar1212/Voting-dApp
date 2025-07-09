import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { FaChartBar } from "react-icons/fa";
export default function Dashboard() {
  const [data, setData] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    socket.on("connect", () => {
      console.log("✅ Connected to socket server");
    });

    socket.on("newVote", (voteCounts) => {
      console.log("Received new vote counts:", voteCounts);
      const chartData = Object.entries(voteCounts).map(([name, votes]) => ({
        name,
        votes,
      }));
      setData(chartData);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Disconnected from WebSocket server due to ", reason);
    });

    return () => socket.disconnect();
  }, []);

  // --- Winner fetching logic ---
  useEffect(() => {
    const fetchWinner = async () => {
      try {
        // You may need to update contractAddress and abi import path as per your project structure
        const { ethers } = await import("ethers");
        const contractAddress = "0x965300a7918847d74Bb31bf464F25684875dcc77";
        const abi = (await import("./VotingABI.json")).default;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);
        const winnerName = await contract.declareWinner();
        setWinner(winnerName);
      } catch (err) {
        setWinner("");
        console.error("Error fetching winner:", err);
      }
    };

    fetchWinner();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 900,
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        padding: "32px 24px",
        margin: "32px auto",
      }}
    >
         
        {!winner && (
          <h1
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 32,
          marginBottom: 32,
          color: "#1976d2",
          letterSpacing: 1,
        }}
        className="flex items-center justify-center gap-2 text-blue-600"
      >
        <FaChartBar className="text-inline text-blue-600"/>
        Live Polling Chart
         </h1>
        )}
      {winner && (
          <h1
        style={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: 32,
          marginBottom: 32,
          color: "#1976d2",
          letterSpacing: 1,
        }}
        className="flex items-center justify-center gap-2 text-blue-600"
      >
        <FaChartBar className="text-inline text-blue-600"/>
        Poll Results
         </h1>
        )}
      
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={data}
          margin={{ top: 24, right: 32, left: 0, bottom: 32 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 18, fill: "#333" }}
            axisLine={{ stroke: "#1976d2" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 16, fill: "#333" }}
            axisLine={{ stroke: "#1976d2" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#f5f7fa",
              border: "1px solid #1976d2",
              borderRadius: 8,
              fontSize: 16,
            }}
            cursor={{ fill: "#e3f2fd" }}
          />
          <Legend
            wrapperStyle={{
              fontSize: 16,
              fontWeight: 500,
              color: "#1976d2",
              paddingBottom: 12,
            }}
          />
          <Bar
            dataKey="votes"
            fill="#1976d2"
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          >
            <LabelList
              dataKey="votes"
              position="top"
              style={{ fill: "#1976d2", fontWeight: "bold", fontSize: 18 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {winner && (
        <div className="mb-8 text-center">
          {winner === "No winner. The voting has been tied." ? (
            <span className="text-2xl font-bold text-yellow-700">
              ⚖️ {winner}
            </span>
          ) : (
            <span className="text-2xl font-bold text-green-700">
              🏆 Winner: {winner}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
