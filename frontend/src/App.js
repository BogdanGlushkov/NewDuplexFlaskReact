// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalendarPage from './pages/CalendarPage';
import ProjectsPage from './pages/ProjectsPage';
import LoginPage from './pages/LoginPage';
import NoAccessPage from './pages/NoAccessPage';
import PrivateRoute from './pages/PrivateRoute';
import ExistingAccounts from './pages/ExistingAccounts';
import MetricsGraph from './pages/MetricsGraph';
import './App.css';

export const BASE_URL = "http://olegperm.fvds.ru/api";

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
          <Route
            path="/metrics"
            element={<PrivateRoute element={MetricsGraph} roles={['admin', 'user']} />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
