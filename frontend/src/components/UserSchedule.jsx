import React from 'react';
import CalendarCell from './CalendarCell';
import '../css/UserSchedule.css';
import { isSameDay } from 'date-fns';

const UserSchedule = ({ user, daysInMonth, onCellClick, selectedCells = [], currentType, currentTime, showPrefix }) => {
  return (
    <div className="user-row">
      <div className="user-name">{showPrefix ? user.prefix : user.name}</div>
      {daysInMonth.map(date => {
        const shift = user.schedule.find(s => isSameDay(s.date, date))?.shift || ' ';
        const type = user.schedule.find(s => isSameDay(s.date, date))?.type || ' ';
        const isSelected = selectedCells.some(cell => isSameDay(cell.date, date) && cell.user === user.name);
        console.log(shift);
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
    </div>
  );
};

export default UserSchedule;
