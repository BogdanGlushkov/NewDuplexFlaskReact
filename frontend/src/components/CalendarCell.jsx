import React, { useState } from 'react';
import '../css/CalendarCell.css';


const CalendarCell = ({ shift, type, onClick, selected, currentType, currentTime }) => {
  const TypeMarks = ({ 'Выходной': '🗑', 'Отпуск': '⛱', 'Больничный': '✚', 'Прогул': '✖' })
  const [isHovered, setIsHovered] = useState(false);

  const getColor = () => {
    switch (type) {
      case 'Рабочий день':
        return 'rgba(204, 255, 204, 1)'; // зеленый
      case 'Выходной':
        return 'white'; // красный
      case 'Отпуск':
        return 'rgba(204, 204, 255, 1)'; // синий
      case 'Больничный':
        return 'rgba(255, 255, 153, 1)'; // светло-желтый
      case 'Выходной за свой счет':
        return 'rgba(255, 204, 153, 1)'; // светло-оранжевый
      case 'Прогул':
        return 'rgba(204, 153, 255, 1)'; // светло-фиолетовый
      case 'Оплачиваемый выходной':
        return 'rgba(255, 204, 153, 1)'; // светло-оранжевый
      default:
        return '';
    }
  };

  const getSelectedOverlayColor = () => {
    switch (currentType) {
      case 'Рабочий день':
        return 'rgba(0, 255, 0, 0.1)'; // полупрозрачный зеленый
      case 'Выходной':
        return 'rgba(255, 0, 0, 0.1)'; // полупрозрачный красный
      case 'Отпуск':
        return 'rgba(0, 0, 255, 0.1)'; // полупрозрачный синий
      case 'Больничный':
        return 'rgba(255, 255, 0, 0.2)'; // полупрозрачный желтый
      case 'Выходной за свой счет':
        return 'rgba(255, 128, 0, 0.2)'; // полупрозрачный оранжевый
      case 'Прогул':
        return 'rgba(128, 0, 128, 0.2)'; // полупрозрачный фиолетовый
      case 'Оплачиваемый выходной':
        return 'rgba(255, 128, 0, 0.2)'; // синий
      default:
        return 'rgba(0, 0, 0, 0.1)'; // полупрозрачный черный
    }
  };

  const getContent = ({selected, currentType, currentTime}) => {
    if (selected) {
      if (currentType === 'Рабочий день') {
        return currentTime.start + ' ' + currentTime.end;
      } else {
        if (currentType === 'Выходной') {
          return shift + TypeMarks[currentType];
        } else {
          return TypeMarks[currentType] ?? 'НЕТ';
        }
      }
    } else {
      return shift;
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`day-cell ${shift !== ' ' ? 'shift' : ''} ${selected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        backgroundColor: selected ? getSelectedOverlayColor() : isHovered ? getSelectedOverlayColor() : getColor(type),
        border: isHovered ? `2px dashed ${getSelectedOverlayColor()}` : selected ? `2px dashed ${getSelectedOverlayColor()}` : '',
        padding: isHovered ? '3px 5px 5px 2px' : selected ? '3px 5px 5px 2px' : '',
      }}
    >
      {getContent({ selected: selected, currentType: currentType, currentTime: currentTime })}
    </div>
  );
};

export default CalendarCell;
