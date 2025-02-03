import React from 'react';
import UserSchedule from './UserSchedule';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale'
import '../css/CalendarGrid.css';

const CalendarGrid = ({ users, onCellClick, selectedCells, currentType, currentTime, currentDate, showPrefix }) => {

  const daysArray = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  return (
    <div className="calendar-grid">
      <div className="header-row">
        <div className="header-cell"></div>
        {daysArray.map((date) => {
          const dayOfWeek = format(date, 'EEEEEE', { locale: ru });
          return (
            <div key={date.getTime()} className={`header-cell ${dayOfWeek === 'сб' || dayOfWeek === 'вс' ? 'weekend' : ''}`}>
              <div>{format(date, 'd')}</div>
              <div>{dayOfWeek}</div>
            </div>
          );
        })}
        <div className="header-cell"></div>
      </div>

      {users.map(user => (
        <UserSchedule
          key={user.name}
          user={user}
          daysInMonth={daysArray}
          onCellClick={onCellClick}
          selectedCells={selectedCells}
          currentType={currentType}
          currentTime={currentTime}
          showPrefix={showPrefix}
          currentDate={currentDate}
        />
      ))}
    </div>
  );
};

export default CalendarGrid;
