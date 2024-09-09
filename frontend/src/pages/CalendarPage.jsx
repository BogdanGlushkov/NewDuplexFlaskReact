import React, { useState, useEffect } from 'react';
import CalendarGrid from '../components/CalendarGrid';
import ScheduleSettings from '../components/ScheduleSettings';
import { getDaysInMonth, addMonths, subMonths, format, isSameDay, startOfMonth, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TypeMarks } from '../constants';
import { logout } from '../utils/auth';
import '../App.css';
import { BASE_URL } from '../App';
import { Link } from 'react-router-dom';

const generateSchedule = (date) => {
  const daysInMonth = getDaysInMonth(date);
  const startDate = startOfMonth(date);
  return Array.from({ length: daysInMonth }, (_, day) => ({
    date: addDays(startDate, day),
    shift: '',
    type: '',
    breaks: [],
  }));
};

const fillEmptySchedule = (existingSchedule, date) => {
  const daysInMonth = getDaysInMonth(date);
  document.documentElement.style.setProperty('--days-in-month', daysInMonth);
  const generatedSchedule = generateSchedule(date);
  const filledSchedule = generatedSchedule.map(generatedDay => {
    const existingDay = existingSchedule.find(day => isSameDay(generatedDay.date, new Date(day.date)));
    return existingDay ? { ...generatedDay, ...existingDay } : generatedDay;
  });

  return filledSchedule.map(item => ({
    ...item,
    shift: TypeMarks[item.type] || item.shift,
  }));
};

const CalendarPage = ({ userName, userRole }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [currentType, setCurrentType] = useState('Рабочий день');
  const [currentTime, setCurrentTime] = useState({ start: '10:00', end: '22:00' });
  const [currentInterval, setCurrentInterval] = useState({ intStart: 2, intEnd: 2 });
  const [currentTemplate, setCurrentTemplate] = useState('Без шаблона');
  const [showPrefix, setShowPrefix] = useState(true); // Added state for prefix visibility

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${BASE_URL}/projects`);
        const fetchedProjects = await res.json();
        
        if (!res.ok) {
          throw new Error(fetchedProjects.error);
        }

        setProjects(fetchedProjects);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        
        const res = await fetch(`${BASE_URL}/users?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`);
        const fetchedUsers = await res.json();
        
        if (!res.ok) {
          throw new Error(fetchedUsers.error);
        }

        const updatedUsers = fetchedUsers.map(user => ({
          ...user,
          schedule: fillEmptySchedule(user.schedule.map(item => ({
            ...item,
            date: new Date(item.date) // don't convert to local date
          })), currentDate)
        }));

        setUsers(updatedUsers);
        setAllUsers(updatedUsers); // сохранить все пользователей
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [currentDate]);

  useEffect(() => {
    if (selectedProject === null) {
      setUsers(allUsers);
    } else {
      const filteredUsers = allUsers.filter(user =>
        user.projects.some(project => project.id === parseInt(selectedProject))
      );
      setUsers(filteredUsers);
    }
  }, [selectedProject, allUsers]);

  const handleSave = async (settings) => {
    const updatedUsers = users.map(user => {
      const isUserSelected = selectedCells.some(cell => cell.user === user.name);
      if (!isUserSelected) return user;

      const updatedSchedule = user.schedule.map(item => {
        const isSelected = selectedCells.some(cell => isSameDay(cell.date, item.date) && cell.user === user.name);

        if (isSelected) {
          return {
            ...item,
            shift: settings.type === "Рабочий день" ? `${settings.start} ${settings.end}` : settings.type !== "Выходной" ? `${TypeMarks[settings.type] ?? settings.type}` : '',
            type: settings.type,
            date: item.date,
            breaks: settings.type === "Рабочий день" ? settings.breaks : []
          };
        }
        return item;
      });

      return {
        ...user,
        schedule: updatedSchedule
      };
    });

    const changes = updatedUsers
      .map(user => ({
        name: user.name,
        schedule: user.schedule.filter(item => selectedCells.some(cell => isSameDay(cell.date, item.date) && cell.user === user.name))
      }))
      .filter(user => user.schedule.length > 0);

    setUsers(updatedUsers);
    setSelectedCells([]);
    setShowSettings(false);

    for (const user of changes) {
      try {
        await fetch(BASE_URL + `/user/${user.name}/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ schedule: user.schedule })
        });
      } catch (error) {
        console.error('Ошибка отправки данных:', error);
      }
    }
  };

  const handleMonthChange = (change) => {
    const newDate = change > 0 ? addMonths(currentDate, change) : subMonths(currentDate, -change);
    setCurrentDate(newDate);
    setUsers(users.map(user => ({
      ...user,
      schedule: generateSchedule(newDate),
    })));
    setCSSDaysInMonth(newDate);
    setSelectedCells([]);
    setShowSettings(false);
  };

  const setCSSDaysInMonth = (date) => {
    const daysInMonth = getDaysInMonth(date);
    document.documentElement.style.setProperty('--days-in-month', daysInMonth);
  };

  const handleCellClick = (date, user) => {
    const cell = { date, user };
    if (userRole === 'admin') {
    setSelectedCells(prevCells => {
      const isCellSelected = prevCells.some(c => isSameDay(c.date, date) && c.user === user);

      if (isCellSelected) {
        return prevCells.filter(c => !(isSameDay(c.date, date) && c.user === user));
      } else {
        return [...prevCells, cell];
      }
    });
  }

    setShowSettings(true);
  };

  return (
    <div className="App">
      <div className='header-contents'>
        <div className='left-content-header'>
          <span>График работы</span>
          <button onClick={() => handleMonthChange(-1)}>{"<"}</button>
          <button onClick={() => handleMonthChange(1)}>{">"}</button>
          <span>{format(currentDate, 'LLLL yyyy', { locale: ru })}</span>
          <div className="project-filter">
            <label>Выберите проект:</label>
            <select value={selectedProject || ''} onChange={(e) => setSelectedProject(e.target.value || null)}>
              <option value="">Все проекты</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="project-filter">
            <label>
              Показать ФИО:
            </label>
            <input 
                type="checkbox" 
                checked={showPrefix} 
                onChange={(e) => setShowPrefix(e.target.checked)} 
              />
          </div>
        </div>
        <div className='right-content-header'>
        {/* <Link to='/breaks'>Перерывы</Link> */}
        {(userRole === 'admin') && 
          <>
            <Link to="/accounts">Аккаунты</Link>
            <Link to="/projects">Проекты</Link>
          </>
        }
          
          {userName && <p>Имя пользователя: {userName}</p>}
          <button onClick={logout} className="logout-button-header">
            Выйти
          </button>
        </div>
      </div>
      <CalendarGrid
        users={users}
        onCellClick={handleCellClick}
        selectedCells={selectedCells || []}
        currentType={currentType}
        currentTime={currentTime}
        currentDate={currentDate}
        showPrefix={showPrefix}
      />
      {showSettings && (userRole === 'admin') && (
        <ScheduleSettings
          onSave={handleSave}
          onClose={() => { setShowSettings(false); setSelectedCells([]); }}
          currentType={currentType}
          currentTime={currentTime}
          currentTemplate={currentTemplate}
          currentInterval={currentInterval}
          selectedCells={selectedCells}
          setCurrentType={setCurrentType}
          setCurrentTime={setCurrentTime}
          setCurrentTemplate={setCurrentTemplate}
          setCurrentInterval={setCurrentInterval}
          setSelectedCells={setSelectedCells}
        />
      )}
    </div>
  );
};

export default CalendarPage;
