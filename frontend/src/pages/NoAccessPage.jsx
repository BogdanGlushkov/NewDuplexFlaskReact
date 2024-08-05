import React from 'react';
import { logout } from '../utils/auth';
import '../css/NoAccessPage.css';

const NoAccessPage = () => {
  return (
    <div className='NoAccess-container'>
      <h2>Доступ запрещен</h2>
      <p>У вас нет доступа к этой странице.</p>
      <button onClick={logout} className="logout-button">
        Выйти
      </button>
    </div>
  );
};

export default NoAccessPage;
