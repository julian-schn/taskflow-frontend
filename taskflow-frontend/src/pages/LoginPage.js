// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useNotification } from '../context/NotificationContext';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toggleAuth } = useAuth();
  const { showNotification } = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Frontend-Only: Login-Status toggeln
    toggleAuth();
    showNotification("Login successful")
    navigate('/');
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Anmelden</button>
      </form>
    </div>
  );
}

export default LoginPage;
