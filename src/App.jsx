import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard.jsx';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './Home.jsx'; 
import Voting from './Voting.jsx';
import Layout from './Layout.jsx';
import AdminDashboardWithSidebar from './AdminDashboard.jsx';
import './index.css'; 

function App() {
  
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/admin" element={<AdminDashboardWithSidebar />} />
        <Route path="/vote" element={<Voting />} />
        </Route>
      </Routes>
    </Router>
  )
}
export default App;

     