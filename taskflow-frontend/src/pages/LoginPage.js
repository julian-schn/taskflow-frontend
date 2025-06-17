import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useNotification } from '../context/NotificationContext';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { toggleAuth } = useAuth();
  const { showNotification } = useNotification();

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    toggleAuth();
    showNotification('Login successful!');
    navigate('/');
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === 'username') setUsername(value);
    if (field === 'password') setPassword(value);
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          {errors.username && <div className="error-message">{errors.username}</div>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className={errors.username ? 'input-error' : ''}
          />
        </div>
        <div className="form-group">
          {errors.password && <div className="error-message">{errors.password}</div>}
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={errors.password ? 'input-error' : ''}
          />
        </div>
        <button type="submit">Login</button>
        <p className="signup-text">
          Don't have an account?{' '}
          <button type="button" className="link-button">Sign Up</button>
          </p>
      </form>
    </div>
  );
}

export default LoginPage;
