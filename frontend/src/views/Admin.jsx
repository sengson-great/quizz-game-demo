
import { useState, useEffect } from 'react';
import api from '../api';

const Admin = () => {
    const [questions, setQuestions] = useState([]);
    const [form, setForm] = useState({ text: '', difficulty: 1, category_id: 1, answers: ['', '', '', ''], correct_idx: 0 });

    useEffect(() => {
        // api.get('/admin/questions').then(res => setQuestions(res.data));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAnswerChange = (idx, val) => {
        const newAnswers = [...form.answers];
        newAnswers[idx] = val;
        setForm({ ...form, answers: newAnswers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // await api.post('/admin/questions', form);
        alert('Question added! (Mock)');
    };

    return (
        <div className="admin-container glass-panel">
            <h2>Admin Dashboard</h2>
            <div className="admin-grid">
                <section className="add-question">
                    <h3>Add Question</h3>
                    <form onSubmit={handleSubmit}>
                        <textarea placeholder="Question Text" name="text" value={form.text} onChange={handleChange} required />
                        <div className="form-row">
                            <input type="number" name="difficulty" min="1" max="15" value={form.difficulty} onChange={handleChange} placeholder="Level (1-15)" required />
                            <select name="category_id" value={form.category_id} onChange={handleChange}>
                                <option value="1">General Knowledge</option>
                                <option value="2">Science</option>
                                <option value="3">History</option>
                            </select>
                        </div>
                        {form.answers.map((ans, i) => (
                            <div key={i} className="answer-input">
                                <input 
                                    type="text" 
                                    placeholder={`Answer ${i+1}`} 
                                    value={ans} 
                                    onChange={(e) => handleAnswerChange(i, e.target.value)} 
                                    required 
                                />
                                <input 
                                    type="radio" 
                                    name="correct_idx" 
                                    checked={Number(form.correct_idx) === i} 
                                    onChange={() => setForm({...form, correct_idx: i})} 
                                /> Correct
                            </div>
                        ))}
                        <button type="submit">Save Question</button>
                    </form>
                </section>
                
                <section className="stats-preview">
                    <h3>Game Stats</h3>
                    <p>Total Games: 124</p>
                    <p>Total Players: 45</p>
                    <p>Most Failed Question: "What is the capital of Australia?"</p>
                </section>
            </div>
        </div>
    );
};

export default Admin;
