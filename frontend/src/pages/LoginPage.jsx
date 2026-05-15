// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [projectId, setProjectId] = useState('');
  const navigate = useNavigate();

  const handleConnect = (e) => {
    e.preventDefault();
    if (projectId.trim()) {
      localStorage.setItem('project_id', projectId);
      navigate('/'); // Redirect to Home
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-xl w-full max-w-md shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Connect Project</h1>
        <p className="text-gray-400 mb-8 text-sm">Enter your 1001 Albums project name to begin.</p>
        
        <form onSubmit={handleConnect} className="space-y-6">
          <input 
            type="text" 
            placeholder="e.g. your-group-name"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-yellow-600 transition"
          />
          <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-4 rounded-xl transition-all shadow-lg shadow-yellow-600/20">
            Enter Daily Journey
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;