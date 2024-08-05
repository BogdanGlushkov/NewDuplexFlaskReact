import React, { useState, useEffect } from 'react';
import '../css/ScheduleSettings.css';

const ScheduleSettings = ({ onSave, onClose, initialValue, currentType, currentTime, currentTemplate, currentInterval, selectedCells, setCurrentType, setCurrentTime, setCurrentTemplate, setCurrentInterval, setSelectedCells }) => {
  const [workingDays, setWorkingDays] = useState({
    Пн: true, Вт: true, Ср: true, Чт: true, Пт: true, Сб: false, Вс: false,
  });
  const [interval, setInterval] = useState(2);
  const [breaks, setBreaks] = useState([]);

  useEffect(() => {
    if (initialValue) {
      setWorkingDays(prevWorkingDays => ({
        ...prevWorkingDays,
        ...initialValue.workingDays
      }));
      setInterval(initialValue.interval || 2);
      setCurrentType(initialValue.type || 'Рабочий день');
      setCurrentTime({ start: initialValue.start || '10:00', end: initialValue.end || '22:00' });
      setCurrentTemplate(initialValue.template || 'Без шаблона');
      setCurrentInterval({ start: initialValue.intStart || 2, end: initialValue.intEnd || 2 });
      setBreaks(initialValue.breaks || []);
    }
  }, [initialValue, setCurrentType, setCurrentTime, setCurrentTemplate, setCurrentInterval]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentTime(prevCurrentTime => ({
      ...prevCurrentTime,
      [name]: value
    }));
  };

  const handleIntervalChange = (e) => {
    const { name, value } = e.target;
    setCurrentInterval(prevCurrentInterval => ({
      ...prevCurrentInterval,
      [name]: value
    }));
  };

  const handleWorkingDayChange = (day) => {
    setWorkingDays(prevDays => ({ ...prevDays, [day]: !prevDays[day] }));
    // updateSelectedCells();
  };

  // const updateSelectedCells = () => {
  //   const newSelectedCells = [];

  //   Object.keys(workingDays).forEach(day => {
  //     if (workingDays[day]) {
  //       selectedCells.forEach(cell => {
  //         if (cell.date === day) {
  //           newSelectedCells.push({ date: cell.date, user: cell.user });
  //         }
  //       });
  //     }
  //   });

  //   setSelectedCells(newSelectedCells);
  // };

  const handleSubmit = () => {
    onSave({ ...currentTime, workingDays, interval, type: currentType, breaks });

  };

  const showWorkTime = currentType === 'Рабочий день';
  const showWorkingDays = currentTemplate === 'По дням недели';
  const showIntervalDates = currentTemplate === 'По сменам';
  const showInterval = currentTemplate !== 'Без шаблона';


  const addBreak = () => {
    setBreaks([...breaks, { start: '12:00', end: '13:00' }]);
  };

  const removeBreak = (index) => {
    setBreaks(breaks.filter((_, i) => i !== index));
  };


  return (
    <div className="schedule-settings">
      <h2>Настройка графика</h2>

      <label>Выбор шаблона</label>
      <select value={currentTemplate} onChange={(e) => setCurrentTemplate(e.target.value)}>
        <option value="Без шаблона">Без шаблона</option>
        {/* <option value="По дням недели">По дням недели</option> */}
        {/* <option value="По сменам">По сменам</option> */}
      </select>

      {showWorkingDays && (  
        <div className="WorkingDays">
          <label>Рабочие дни</label>
          <div className="working-days">
            {Object.keys(workingDays).map(day => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={workingDays[day]}
                  onChange={() => handleWorkingDayChange(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      )}

      {showIntervalDates && (
        <div className="WorkingDays">
          <label>Рабочие / выходные</label>
          <div className="interval">
            <input
              type="number"
              name="intStart"
              value={currentInterval.intStart}
              onChange={handleIntervalChange}
            />
            <p>через</p>
            <input
              type="number"
              name="intEnd"
              value={currentInterval.intEnd}
              onChange={handleIntervalChange}
            />
          </div>
        </div>
      )}

      {showInterval && (
        <>
        <label>Интервал действия </label>
        <div className="interval">
        <input
          type="number"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
        />
        <p>(недели)</p>
        </div>
        </>
      )}
        
        
      

      <label>Тип</label>
      <select value={currentType} onChange={(e) => setCurrentType(e.target.value)}>
        <option value="Рабочий день">💼 Рабочий день</option>
        <option value="Выходной">🗑 Выходной</option>
        <option value="Больничный">✚ Больничный</option>
        <option value="Отпуск">⛱ Отпуск</option>
        {/* <option value="Выходной за свой счет">✉ Выходной за свой счет </option> */}
        <option value="Прогул">✖ Прогул</option>
        {/* <option value="Оплачиваемый выходной">✉ Оплачиваемый выходной </option> */}
      </select>

      {showWorkTime && (
        <div className="WorkTime">
          <label>Рабочее время</label>
          <div className="time-change">
            <input
              type="time"
              name="start"
              value={currentTime.start}
              onChange={handleChange}
            />
            <p> — </p>
            <input
              type="time"
              name="end"
              value={currentTime.end}
              onChange={handleChange}
            />
          </div>
          {breaks.map((breakTime, index) => (
            <div className="break-time" key={index}>
              <label>Перерыв</label>
              <div className="time-change">
                <input
                  type="time"
                  name="start"
                  value={breakTime.start}
                  onChange={(e) => {
                    const newBreaks = [...breaks];
                    newBreaks[index].start = e.target.value;
                    setBreaks(newBreaks);
                  }}
                />
                <p> — </p>
                <input
                  type="time"
                  name="end"
                  value={breakTime.end}
                  onChange={(e) => {
                    const newBreaks = [...breaks];
                    newBreaks[index].end = e.target.value;
                    setBreaks(newBreaks);
                  }}
                />
                <span onClick={() => removeBreak(index)}>
                🗑
                </span>
              </div>
              
            </div>
          ))}
          <span className="AddBreak" onClick={addBreak}>
            + Добавить перерыв
          </span>
        </div>
      )}
      

      <div className="btn-bottom">
        <button onClick={handleSubmit}>Сохранить</button>
        <button onClick={onClose}>Отменить</button>
      </div>
    </div>
  );
};

export default ScheduleSettings;
