import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaHome, FaVoteYea, FaInfoCircle, FaUserShield } from "react-icons/fa";

export default function Layout() {
  const navigate = useNavigate();
  // You can pass walletConnected as prop or use context if needed
  const walletConnected = false; // Remove or replace as needed

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <h1 className="text-2xl font-bold">🗳 D-Vote</h1>
          <nav className="space-x-6 flex items-center">
            <Link to="/" className="hover:text-blue-400 flex items-center gap-2">
              <FaHome className="inline-block mb-0.5" /> Home
            </Link>
            
            <Link to="/admin" className="hover:text-blue-400 flex items-center gap-2">
              <FaUserShield className="inline-block mb-0.5" /> Admin Dashboard
            </Link>
            <Link to="/about" className="hover:text-blue-400 flex items-center gap-2">
              <FaInfoCircle className="inline-block mb-0.5" /> About
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="bg-black text-white py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} D-Vote. All rights reserved.</p>
          <div className="space-x-4 mt-2 md:mt-0">
            <a href="#" className="hover:underline text-sm">Privacy</a>
            <a href="#" className="hover:underline text-sm">Terms</a>
            <a href="https://github.com/Esar1212/Voting-dApp" className="hover:underline text-sm">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}