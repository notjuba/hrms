import { useState, useEffect } from 'react';
import {
    HiOutlineUsers,
    HiOutlineOfficeBuilding,
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineUserAdd,
    HiOutlineCheckCircle
} from 'react-icons/hi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="spinner"></div>
            </div>
        );
    }

    const statsCards = [
        {
            icon: HiOutlineUsers,
            label: 'Total Employees',
            value: stats?.stats?.totalEmployees || 0,
            color: '#6172f3',
            gradient: 'linear-gradient(135deg, #6172f3 0%, #8098f9 100%)'
        },
        {
            icon: HiOutlineOfficeBuilding,
            label: 'Departments',
            value: stats?.stats?.totalDepartments || 0,
            color: '#a855f7',
            gradient: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)'
        },
        {
            icon: HiOutlineCalendar,
            label: 'Pending Leaves',
            value: stats?.stats?.pendingLeaves || 0,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
        },
        {
            icon: HiOutlineClock,
            label: 'Present Today',
            value: stats?.stats?.todayPresent || 0,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
        },
        {
            icon: HiOutlineUserAdd,
            label: 'New Hires (30d)',
            value: stats?.stats?.recentHires || 0,
            color: '#ec4899',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
        },
        {
            icon: HiOutlineCheckCircle,
            label: 'Active Employees',
            value: stats?.stats?.activeEmployees || 0,
            color: '#22d3ee',
            gradient: 'linear-gradient(135deg, #22d3ee 0%, #67e8f9 100%)'
        }
    ];

    const deptChartData = {
        labels: stats?.employeesByDept?.map(d => d.name) || [],
        datasets: [{
            data: stats?.employeesByDept?.map(d => d.count) || [],
            backgroundColor: [
                'rgba(97, 114, 243, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(34, 211, 238, 0.8)',
                'rgba(16, 185, 129, 0.8)',
            ],
            borderWidth: 0
        }]
    };

    const attendanceChartData = {
        labels: stats?.attendanceTrend?.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }) || [],
        datasets: [{
            label: 'Attendance',
            data: stats?.attendanceTrend?.map(d => d.count) || [],
            backgroundColor: 'rgba(97, 114, 243, 0.6)',
            borderColor: 'rgba(97, 114, 243, 1)',
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#a1a1aa',
                    padding: 20,
                    font: { family: 'Inter' }
                }
            }
        }
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#a1a1aa' }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#a1a1aa' }
            }
        }
    };

    return (
        <div className="dashboard">
            {/* Stats Grid */}
            <div className="stats-grid">
                {statsCards.map((card, index) => (
                    <div key={index} className="stats-card">
                        <div
                            className="stats-card-icon"
                            style={{ background: card.gradient }}
                        >
                            <card.icon />
                        </div>
                        <div className="stats-card-value">{card.value}</div>
                        <div className="stats-card-label">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                <div className="chart-card glass-card">
                    <h3 className="chart-title">Employees by Department</h3>
                    <div className="chart-container">
                        <Doughnut data={deptChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card glass-card">
                    <h3 className="chart-title">Attendance Trend (7 Days)</h3>
                    <div className="chart-container">
                        <Bar data={attendanceChartData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Recent Leaves */}
            <div className="recent-section glass-card">
                <h3 className="section-title">Recent Leave Requests</h3>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Duration</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recentLeaves?.map((leave) => (
                                <tr key={leave.id}>
                                    <td>
                                        <div className="employee-cell">
                                            <div className="avatar avatar-sm">
                                                {leave.employee.firstName[0]}{leave.employee.lastName[0]}
                                            </div>
                                            <span>{leave.employee.firstName} {leave.employee.lastName}</span>
                                        </div>
                                    </td>
                                    <td>{leave.leaveType}</td>
                                    <td>
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'error' : 'warning'}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.recentLeaves || stats.recentLeaves.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="text-center text-secondary">No recent leave requests</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
