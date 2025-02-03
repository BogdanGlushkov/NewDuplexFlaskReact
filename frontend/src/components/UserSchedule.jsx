import React, { useState, useEffect } from 'react';
import CalendarCell from './CalendarCell';
import '../css/UserSchedule.css';
import { isSameDay } from 'date-fns';
import { BASE_URL } from '../App';

const UserSchedule = ({ user, daysInMonth, onCellClick, selectedCells = [], currentType, currentTime, showPrefix }) => {

  const [WorkedTime, SetWorkedTime] = useState('00:00:00');

  useEffect(() => {
    const fetchWorkedTime = async () => {
      try {
        const res = await fetch(`${BASE_URL}/get_hours`);
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
  }, []);


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
      <div className="">
        <div className="">Ожидаемое: 00:00:00</div>
        <div className="">Фактическое: {WorkedTime ? WorkedTime : '00:00:00'}</div>
      </div>


    </div>
  );
};

export default UserSchedule;
