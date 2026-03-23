
import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = ({ setUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.get('/sanctum/csrf-cookie', { 
                baseURL: 'http://localhost:8000',
                withCredentials: true 
            });
            const res = await api.post('/register', { name, email, password, password_confirmation: confirmPassword });
            localStorage.setItem('access_token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Registration failed. ' + JSON.stringify(error.response?.data?.message || 'Error'));
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-card">
                <h2>Join the Game</h2>
                <form onSubmit={handleRegister}>
                    <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <button type="submit" className="neon-button">Sign Up</button>
                </form>
                <div className="auth-links">
                    <Link to="/">Already have an account?</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
