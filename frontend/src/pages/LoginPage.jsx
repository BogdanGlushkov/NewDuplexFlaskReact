import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/LoginPage.css';
import { BASE_URL } from '../App';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/login`, {
        username,
        password
      });

      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/');
    } catch (error) {
      setError('Неверное имя пользователя или пароль');
    }
  };

  return (
    <div className='login-container'>
      <h2>Вход</h2>
      <form onSubmit={handleLogin}>
        <div className='login-form-style'>
          <label htmlFor="username">Логин:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <br />
        <div className='login-form-style'>
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default LoginPage;
