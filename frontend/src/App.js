// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalendarPage from './pages/CalendarPage';
import ProjectsPage from './pages/ProjectsPage';
import LoginPage from './pages/LoginPage';
import NoAccessPage from './pages/NoAccessPage';
import PrivateRoute from './pages/PrivateRoute';
import ExistingAccounts from './pages/ExistingAccounts';
import './App.css';

export const BASE_URL = "http://127.0.0.1:5000/api";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/no-access" element={<NoAccessPage />} />
          <Route
            path="/projects"
            element={<PrivateRoute element={ProjectsPage} roles={['admin']} />}
          />
          <Route
            path="/"
            element={<PrivateRoute element={CalendarPage} roles={['admin', 'user']} />}
          />
          <Route
            path="/accounts"
            element={<PrivateRoute element={ExistingAccounts} roles={['admin']} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
