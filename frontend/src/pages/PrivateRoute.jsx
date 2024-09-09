// src/pages/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ element: Component, roles }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  const { isAuthenticated, userRole, userName } = useAuth(token);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (roles && roles.length > 0 && !roles.includes(userRole)) {
    return <Navigate to="/no-access" />;
  }

  return <Component userName={ userName } userRole={ userRole } />;
};

// Функция для проверки токена и получения роли
const useAuth = (token) => {
  if (!token) {
    return { isAuthenticated: false, userRole: null, userName: null };
  }

  try {
    const decodedToken = jwtDecode(token);

    const isAuthenticated = Date.now() < decodedToken.exp * 1000;

    // Получаем роль и имя пользователя из токена
    const userRole = decodedToken.role || null;
    const userName = decodedToken.username || null;

    return { isAuthenticated, userRole, userName };
  } catch (error) {
    console.error('Token decode error:', error);
    return { isAuthenticated: false, userRole: null, userName: null };
  }
};

export default PrivateRoute;
