import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './pages/userdashboard/Home';

import 'bootstrap/dist/css/bootstrap.min.css';
import AdminDashboard from './pages/admindashboard/AdminDashboard';
import ResolverDashboard from './pages/resolverdashboard/ResolverDashboard';

 

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated on initial load
    const token = sessionStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <>
     
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
        />
        <Route path='/admin' element={<AdminDashboard/>}/>
        <Route path='/admin' element={<ResolverDashboard/>}/>
      </Routes>
    </>
  );
}

export default App;