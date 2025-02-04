import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { BASE_URL } from '../App';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [newProject, setNewProject] = useState('');
  const [newProjectCost, setNewProjectCost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${BASE_URL}/projects`);
        const fetchedProjects = await res.json();

        if (!res.ok) {
          throw new Error(fetchedProjects.error);
        }

        setProjects(fetchedProjects);
        setLoading(false);
      } catch (error) {
        setError(error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/users_list`);
        const fetchedUsers = await res.json();

        if (!res.ok) {
          throw new Error(fetchedUsers.error);
        }

        setUsers(fetchedUsers);
      } catch (error) {
        setError(error);
      }
    };

    fetchProjects();
    fetchUsers();
  }, []);

  const handleAddProject = () => {
    if (newProject.trim() && !isNaN(parseFloat(newProjectCost.trim()))) {
      const newProjectData = {
        name: newProject,
        cost: parseFloat(newProjectCost),
        users: [] // Изначально не назначаем пользователей
      };

      fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProjectData),
      })
        .then(response => response.json())
        .then(data => {
          setProjects(prevProjects => [...prevProjects, data]);
          setNewProject('');
          setNewProjectCost('');
          setShowForm(false);
        })
        .catch(error => {
          setError(error);
        });
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setSelectedUsers(project.users.map(user => user.id)); // Устанавливаем выбранных пользователей
    setNewProject(project.name);
    setNewProjectCost(project.cost);
    setShowForm(true); // Показываем форму редактирования
  };

  const handleUserChange = (userId) => {
    setSelectedUsers(prevSelectedUsers =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter(id => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  const handleUpdateProject = () => {
    if (selectedProject) {
      const updatedProject = {
        ...selectedProject,
        name: newProject.trim() || selectedProject.name,
        cost: parseFloat(newProjectCost) || selectedProject.cost,
        users: selectedUsers.map(id => users.find(user => user.id === id)) // Обновляем пользователей
      };

      fetch(`${BASE_URL}/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject),
      })
        .then(response => response.json())
        .then(data => {
          setProjects(prevProjects =>
            prevProjects.map(p => (p.id === data.id ? data : p))
          );
          setSelectedProject(null);
          setSelectedUsers([]);
          setShowForm(false); // Закрываем форму после сохранения
        })
        .catch(error => {
          setError(error);
        });
    }
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      fetch(`${BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete project');
          }
          setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
          setSelectedProject(null);
          setSelectedUsers([]);
          setShowForm(false); // Закрываем форму после удаления
        })
        .catch(error => {
          setError(error);
        });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="App">
      <div className='header-contents'>
        <span>Проекты</span>
        <Link to="/">Календарь</Link>
      </div>
      <div className="container-flex">
        <div className='left-content'>
          <div>
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project)}
                style={{ cursor: 'pointer' }}
              >
                <h3>{project.name}</h3>
                <p>Стоимость: {project.cost}</p>
                <p>Пользователи:</p>
                <ul>
                  {project.users.map(user => (
                    <li key={user.id}>{user.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className='right-content'>
          {!showForm && <button onClick={() => { setShowForm(true); setSelectedProject(null); }}>Добавить проект</button>}
          {showForm && (
            <div className='Add_project'>
              <label>Название проекта</label>
              <input
                type="text"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                placeholder="Введите название проекта"
              />
              <label>Стоимость проекта в Рублях</label>
              <input
                type="number"
                value={newProjectCost}
                onChange={(e) => setNewProjectCost(e.target.value)}
                placeholder="1000"
              />
              {selectedProject && (
                <div>
                  <h3>Выберите пользователей:</h3>
                  <div className='overflow-selector'>
                    {users.map(user => (
                      <div key={user.id} className='input_operators_PR'>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserChange(user.id)}
                        />
                        <label>{user.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={selectedProject ? handleUpdateProject : handleAddProject}>
                {selectedProject ? 'Сохранить изменения' : 'Добавить'}
              </button>
              {selectedProject && (
                <button onClick={() => handleDeleteProject(selectedProject.id)} style={{ color: 'red' }}>
                  Удалить проект
                </button>
              )}
              <button onClick={() => { setShowForm(false); setSelectedProject(null); setSelectedUsers([]); }}>Отмена</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
