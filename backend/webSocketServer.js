require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const abi = require("./VotingABI.json"); // Import the ABI of the contract
const ethers = require("ethers");


const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  provider // Connects the contract to the blockchain (the sepolia testnet)
);

// Track votes per candidate
let voteCounts = {};

async function initializeVoteCounts() {
  const candidates = await contract.getAllCandidates();
  for (const candidate of candidates) {
    const votes = await contract.totalVotesFor(candidate);
    voteCounts[candidate] = votes.toNumber();
  }
}

initializeVoteCounts().then(() => {
  contract.on("VoteCast", async (voter, candidate) => {
    console.log(`${voter} voted for ${candidate}`);

    // Update local count
    voteCounts[candidate] = (voteCounts[candidate] || 0) + 1;

    // Broadcast to all clients
    console.log("Emitting new vote counts:", voteCounts);
    io.emit("newVote", voteCounts);
  });

  contract.on("RestartPoll",()=>{
    console.log("Poll restarted");
    for (const candidate in voteCounts) {
      voteCounts[candidate] = 0; // Reset all counts to zero
    }
    io.emit("newVote", voteCounts);
  });

contract.on("AddCandidates", (candidates) => {
    candidates.forEach((candidate) => {
      voteCounts[candidate] = 0;
    });
    io.emit("newVote", voteCounts); // Emit updated vote counts   
  });

  
  contract.on("RemoveCandidates", () => {
    for (const candidate in voteCounts) {
    delete voteCounts[candidate];
    } 
    io.emit("newVote", voteCounts); // Emit updated vote counts   
  });
  io.on("connection", (socket) => {
    console.log("A User connected!");

    // Send initial vote counts on connection to the connected user
    socket.emit("newVote", voteCounts);
  });

  const PORT = 4000;
  server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
});
