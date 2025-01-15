import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BASE_URL } from '../App';

const MetricsGraph = () => {
    const [metrics, setMetrics] = useState([]);
    const [error, setError] = useState('');

    // Цвета для диаграммы
    const COLORS = [
        '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF',
        '#FF4567', '#19D3F3', '#AB5FFF', '#F39C12', '#E74C3C'
    ];

    const getCurrentMonthRange = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const formatDate = (date) =>
            date.toISOString().split('T')[0]; // Формат YYYY-MM-DD

        return {
            start_date: formatDate(startOfMonth),
            end_date: formatDate(endOfMonth),
        };
    };

    useEffect(() => {
        const fetchMetrics = async () => {
            const token = localStorage.getItem('token');
            const { start_date, end_date } = getCurrentMonthRange();
            try {
                const response = await axios.get(
                    `${BASE_URL}/get_metrika?start_date=${start_date}&end_date=${end_date}&limit=10`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setMetrics(response.data);
            } catch (err) {
                console.error('Произошла ошибка при загрузке данных метрик:', err);
                setError('Произошла ошибка при загрузке данных метрик.');
            }
        };

        fetchMetrics();
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    if (metrics.length === 0) {
        return <div>Загрузка данных...</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie
                    data={metrics}
                    dataKey="AvgCountIncoming"
                    nameKey="user"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label
                >
                    {metrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default MetricsGraph;