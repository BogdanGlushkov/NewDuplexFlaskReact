import React, { useState, useEffect } from 'react';
import CalendarCell from './CalendarCell';
import '../css/UserSchedule.css';
import { isSameDay } from 'date-fns';
import { BASE_URL } from '../App';

const UserSchedule = ({ user, daysInMonth, onCellClick, selectedCells = [], currentType, currentTime, showPrefix, currentDate }) => {

  const [WorkedTime, SetWorkedTime] = useState('00:00:00');
  const [EstimatedTime, SetEstimatedTime] = useState('00:00:00');
  const UserId = user.id;

  useEffect(() => {
    const fetchWorkedTime = async () => {
      try {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        const res = await fetch(`${BASE_URL}/get_hours?start_date=${startOfMonth.toISOString()}&end_date=${endOfMonth.toISOString()}&user_id=${UserId}`);
        const fetchedTime = await res.json();

        if (!res.ok) {
          throw new Error(fetchedTime.error);
        }

        SetWorkedTime(fetchedTime.hours);
      } catch (error) {
        console.error(error);
      }
    };

    fetchWorkedTime();
  }, [currentDate, UserId]);

  useEffect(() => {
    const calculateWorkingTime = (user) => {
      const workingDays = user.schedule.filter(day => day.type === "Рабочий день");

      const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      let totalMinutes = 0;

      workingDays.forEach((day) => {
        const [start, end] = day.shift.split(' ');
        let workMinutes = timeToMinutes(end) - timeToMinutes(start);

        // Обрабатываем перерывы, если они есть
        if (day.breaks) {
          try {
            const breaks = JSON.parse(day.breaks);
            breaks.forEach(breakPeriod => {
              workMinutes -= timeToMinutes(breakPeriod.end) - timeToMinutes(breakPeriod.start);
            });
          } catch (error) {
            console.error("Ошибка парсинга перерывов:", error);
          }
        }

        totalMinutes += workMinutes;
      });

      const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
      const minutes = String(totalMinutes % 60).padStart(2, '0');

      return `${hours}:${minutes}:00`;
    };

    SetEstimatedTime(calculateWorkingTime(user));
  }, [user]);


  return (
    <div className="user-row">
      <div className="user-name">{showPrefix ? user.prefix : user.name}</div>
      {daysInMonth.map(date => {
        const shift = user.schedule.find(s => isSameDay(s.date, date))?.shift || ' ';
        const type = user.schedule.find(s => isSameDay(s.date, date))?.type || ' ';
        const isSelected = selectedCells.some(cell => isSameDay(cell.date, date) && cell.user === user.name);
        return (
          <CalendarCell
            key={date.getTime()}
            shift={shift}
            type={type}
            onClick={() => onCellClick(date, user.name)}
            selected={isSelected}
            currentType={currentType}
            currentTime={currentTime}
          />
        );
      })}
      <div className="flex-column">
        <div className="">Ожидаемое: {EstimatedTime}</div>
        <div className="">Фактическое: {WorkedTime}</div>
      </div>


    </div>
  );
};

export default UserSchedule;
