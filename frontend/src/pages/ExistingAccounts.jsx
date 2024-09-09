import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../App';
import { Link } from 'react-router-dom';

const ExistingAccounts = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [prefix, setPrefix] = useState('');
    const [user, setUser] = useState('');
    const [role, setRole] = useState('user');
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [operators, setOperators] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchOperators();
        fetchProjects();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${BASE_URL}/users_account`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data);
        } catch (err) {
            console.error('Произошла ошибка при загрузке пользователей:', err);
            setError('Произошла ошибка при загрузке пользователей - fetchUsers');
        }
    };

    const fetchOperators = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${BASE_URL}/users_list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setOperators(response.data);
        } catch (err) {
            console.error('Произошла ошибка при загрузке операторов:', err);
            setError('Произошла ошибка при загрузке операторов - fetchOperators');
        }
    };

    const fetchProjects = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${BASE_URL}/projects`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProjects(response.data);
        } catch (err) {
            console.error('Произошла ошибка при загрузке проектов:', err);
            setError('Произошла ошибка при загрузке проектов - fetchProjects');
        }
    };

    const handleAddOrUpdateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        const endpoint = selectedUser ? `/users_account/${selectedUser.id}` : '/users_account';
        const method = selectedUser ? 'put' : 'post';
        
        try {
            await axios[method](`${BASE_URL}${endpoint}`, { username, password, role, prefix, user, is_active: isActive }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsername('');
            setPassword('');
            setPrefix('');
            setRole('user');
            setUser('');
            setIsActive(true); // Reset activity status
            setSelectedUser(null);
            fetchUsers();
            alert(selectedUser ? 'Пользователь успешно обновлен' : 'Пользователь добавлен успешно');
        } catch (err) {
            setError('Возникла ошибка при добавлении пользователя. Пожалуйста проверьте все и попробуйте еще раз.');
            console.error('Возникла ошибка при добавлении иди изменении пользователя - handleAddOrUpdateUser:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Вы уверены что хотите удалить этого пользователя?')) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`${BASE_URL}/users_account/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                fetchUsers();
                alert('Пользователь удален успешно');
            } catch (err) {
                console.error('Ошибка при удалении пользователя:', err);
                alert('Ошибка при удалении пользователя - handleDeleteUser');
            }
        }
    };

    const handleEditUser = (user) => {
        setUsername(user.username);
        setPassword('');
        setPrefix(user.prefix || '');
        setRole(user.role);
        setUser(user.operator_id || '');
        console.log(user.isActive);
        setIsActive(user.isActive || true); 
        setSelectedUser(user);
    };

    const getOperatorNameById = (id) => {
        const operator = operators.find(op => op.id === id);
        return operator ? operator.name : 'Неизвестный оператор';
    };

    const getUserProjects = (userId) => {
        const userProjects = projects.filter(project => project.users.some(user => user.operator_id === userId));
        return userProjects.map(project => project.name).join(', ');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'space-between'}}><h2>Управление пользователями </h2> <h2><Link to="/">Календарь</Link></h2></div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleAddOrUpdateUser} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '20px', borderRadius: '5px' }}>
                <h3>{selectedUser ? 'Обновление пользователя' : 'Добавление нового пользователя'}</h3>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="username">Логин:</label>
                    <input 
                        type="text" 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Оператор №" 
                        required 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="password">Пароль:</label>
                    <input 
                        type="text" 
                        id="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Пароль" 
                        required={!selectedUser} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="prefix">ФИО:</label>
                    <input 
                        type="text" 
                        id="prefix" 
                        value={prefix} 
                        onChange={(e) => setPrefix(e.target.value)} 
                        placeholder="ФИО" 
                        required 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="role">Роль:</label>
                    <select 
                        id="role" 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    >
                        <option value="user">Оператор</option>
                        <option value="admin">Администратор</option>
                    </select>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="user">Привязанный оператор:</label>
                    <select 
                        id="user" 
                        value={user} 
                        onChange={(e) => setUser(e.target.value)} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    >
                        <option value="">Выберите оператора</option>
                        {operators.map(operator => (
                            <option key={operator.id} value={operator.id}>
                                {operator.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="isActive">Активность аккаунта:</label>
                    <input 
                        type="checkbox" 
                        id="isActive" 
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        style={{ width: 'auto', marginRight: '8px' }}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}
                >
                    {loading ? 'Загрузка...' : selectedUser ? 'Обновить' : 'Добавить'}
                </button>
            </form>

            <h3>Список пользователей</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ФИО</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Логин</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Оператор</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Роль</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Активность</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Проекты</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.prefix}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{getOperatorNameById(user.operator_id)}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.isActive ? '✔' : '✘'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{getUserProjects(user.id)}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {user.username !== 'root' && (
                                    <>
                                        <button onClick={() => handleEditUser(user)} style={{ marginRight: '10px' }}>Изменить</button>
                                        <button onClick={() => handleDeleteUser(user.id)} style={{ color: 'red' }}>Удалить</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExistingAccounts;
