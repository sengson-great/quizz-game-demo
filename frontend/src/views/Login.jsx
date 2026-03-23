
import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await api.get('/sanctum/csrf-cookie', { 
                baseURL: 'http://localhost:8000',
                withCredentials: true 
            });
            const res = await api.post('/login', { email, password });
            localStorage.setItem('access_token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-card">
                <h2>Millionaire Login</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="neon-button">Start Game</button>
                </form>
                <div className="auth-links">
                    <Link to="/register">Create an Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
