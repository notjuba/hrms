import { useState, useEffect } from 'react';
import { HiOutlineLogin, HiOutlineLogout, HiOutlineCalendar } from 'react-icons/hi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Attendance.css';

const Attendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        try {
            const [attRes, empRes] = await Promise.all([
                api.get(`/attendance?date=${selectedDate}`),
                api.get('/employees')
            ]);
            setAttendance(attRes.data);
            setEmployees(empRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!user?.employee?.id) return;
        try {
            await api.post('/attendance/check-in', { employeeId: user.employee.id });
            loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleCheckOut = async () => {
        if (!user?.employee?.id) return;
        try {
            await api.post('/attendance/check-out', { employeeId: user.employee.id });
            loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    const getTimeString = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const myAttendance = attendance.find(a => a.employeeId === user?.employee?.id);
    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    if (loading) {
        return <div className="flex items-center justify-center h-full"><div className="spinner"></div></div>;
    }

    return (
        <div className="attendance-page">
            {/* Quick Actions */}
            {isToday && user?.employee && (
                <div className="quick-actions glass-card">
                    <div className="action-info">
                        <h3>Today's Status</h3>
                        <p className="text-secondary">
                            {myAttendance
                                ? `Checked in at ${getTimeString(myAttendance.checkIn)}${myAttendance.checkOut ? ` • Checked out at ${getTimeString(myAttendance.checkOut)}` : ''}`
                                : 'Not checked in yet'
                            }
                        </p>
                    </div>
                    <div className="action-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={handleCheckIn}
                            disabled={!!myAttendance}
                        >
                            <HiOutlineLogin /> Check In
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleCheckOut}
                            disabled={!myAttendance || !!myAttendance.checkOut}
                        >
                            <HiOutlineLogout /> Check Out
                        </button>
                    </div>
                </div>
            )}

            {/* Date Filter */}
            <div className="page-header">
                <div className="date-picker">
                    <HiOutlineCalendar className="date-icon" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="attendance-summary">
                    <span className="badge badge-success">{attendance.filter(a => a.status === 'PRESENT').length} Present</span>
                    <span className="badge badge-warning">{attendance.filter(a => a.status === 'LATE').length} Late</span>
                    <span className="badge badge-error">{employees.length - attendance.length} Absent</span>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Status</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.map((record) => (
                            <tr key={record.id}>
                                <td>
                                    <div className="employee-cell">
                                        <div className="avatar avatar-sm">
                                            {record.employee.firstName[0]}{record.employee.lastName[0]}
                                        </div>
                                        <span>{record.employee.firstName} {record.employee.lastName}</span>
                                    </div>
                                </td>
                                <td>{getTimeString(record.checkIn)}</td>
                                <td>{getTimeString(record.checkOut)}</td>
                                <td>
                                    <span className={`badge badge-${record.status === 'PRESENT' ? 'success' : record.status === 'LATE' ? 'warning' : 'error'}`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="text-secondary">{record.notes || '-'}</td>
                            </tr>
                        ))}
                        {attendance.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center text-secondary">No attendance records for this date</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;
