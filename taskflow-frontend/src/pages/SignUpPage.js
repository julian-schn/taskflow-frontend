import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import './SignUpPage.css';

export default function SignUpPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSignUp = e => {
    e.preventDefault();
    // hier später echte SignUp-Logik
    showNotification('Sign Up successful');
    navigate('/login');
  };

  return (
    <div className="signup-page">
      <h1>Sign Up</h1>
      <form className="signup-form" onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Username"
          value={user}
          onChange={e => setUser(e.target.value)}
          required
        />
        <input 
          type="text"
          placeholder="E-mail"
          val
        />
        <input
          type="password"
          placeholder="Passwort"
          value={pass}
          onChange={e => setPass(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
