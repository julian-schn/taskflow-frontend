import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useNotification } from '../context/NotificationContext';
import CloseIcon from '../assets/close.svg';
import './LoginPage.css';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { showNotification } = useNotification();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username.trim()) newErrors.username = 'Username is required';

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain letters and numbers';
    }

    return newErrors;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await register(username, password);
    if (result.success) {
      showNotification('Registration successful! You are now logged in.');
      navigate('/');
    } else {
      setErrors({ general: result.error });
      showNotification('Registration failed: ' + result.error);
    }
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === 'username') setUsername(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
  };

  return (
    <div className="login-page">
      <button className="close-button" onClick={() => navigate('/')} aria-label="Close">
        <img src={CloseIcon} alt="Close" />
      </button>

      <h1>Sign Up</h1>
      <form className="login-form" onSubmit={handleSignUp} noValidate>
        <div className="form-group">
          {errors.username && <div className="error-message">{errors.username}</div>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className={errors.username ? 'input-error' : ''}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          {errors.email && <div className="error-message">{errors.email}</div>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'input-error' : ''}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          {errors.password && <div className="error-message">{errors.password}</div>}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={errors.password ? 'input-error' : ''}
            disabled={loading}
          />
        </div>
        {errors.general && <div className="error-message">{errors.general}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        <p className="signup-text">
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={() => navigate('/login')}>
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
