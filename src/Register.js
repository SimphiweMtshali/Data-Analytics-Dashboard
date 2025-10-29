import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Import the CSS file

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost/webapp-backend/register.php', {
        name,
        email,
        password,
      });
      setMessage(res.data.message);
      navigate('/'); // Redirect to login page
    } catch (err) {
      setMessage(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleLoginNavigate = () => {
    navigate('/');
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Register</button>
        </form>
        {message && (
          <p
            style={{
              textAlign: 'center',
              marginTop: '10px',
              color: message.includes('failed') ? '#f44336' : '#4CAF50',
            }}
          >
            {message}
          </p>
        )}
        <button onClick={handleLoginNavigate} className="login-btn">
          Login
        </button>
      </div>
    </div>
  );
}

export default Register;
