
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Game from './views/Game'
import Admin from './views/Admin'
import Login from './views/Login'
import Register from './views/Register'
import Dashboard from './views/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null); // Simple auth state for now

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/game" element={user ? <Game user={user} /> : <Navigate to="/" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
