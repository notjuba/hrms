import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './LeaveManagement.css';

const LeaveManagement = () => {
    const { isHRManager, user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        leaveType: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [leaveRes, empRes] = await Promise.all([
                api.get('/leaves'),
                api.get('/employees')
            ]);
            setLeaves(leaveRes.data);
            setEmployees(empRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leaves', formData);
            setShowModal(false);
            setFormData({ employeeId: '', leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
            loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.patch(`/leaves/${id}/status`, { status });
            loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    const filteredLeaves = leaves.filter(leave =>
        filter === 'ALL' || leave.status === filter
    );

    const leaveTypes = ['ANNUAL', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'UNPAID'];

    if (loading) {
        return <div className="flex items-center justify-center h-full"><div className="spinner"></div></div>;
    }

    return (
        <div className="leaves-page">
            <div className="page-header">
                <div className="filter-tabs">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                        <button
                            key={status}
                            className={`filter-tab ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <HiOutlinePlus /> Request Leave
                </button>
            </div>

            <div className="leaves-grid">
                {filteredLeaves.map((leave) => (
                    <div key={leave.id} className="leave-card glass-card">
                        <div className="leave-header">
                            <div className="employee-info">
                                <div className="avatar avatar-sm">
                                    {leave.employee.firstName[0]}{leave.employee.lastName[0]}
                                </div>
                                <span>{leave.employee.firstName} {leave.employee.lastName}</span>
                            </div>
                            <span className={`badge badge-${leave.status === 'APPROVED' ? 'success' : leave.status === 'REJECTED' ? 'error' : 'warning'}`}>
                                {leave.status}
                            </span>
                        </div>
                        <div className="leave-type">
                            <span className="badge badge-primary">{leave.leaveType}</span>
                        </div>
                        <div className="leave-dates">
                            <span>{new Date(leave.startDate).toLocaleDateString()}</span>
                            <span className="date-separator">→</span>
                            <span>{new Date(leave.endDate).toLocaleDateString()}</span>
                        </div>
                        {leave.reason && <p className="leave-reason">{leave.reason}</p>}

                        {isHRManager && leave.status === 'PENDING' && (
                            <div className="leave-actions">
                                <button
                                    className="btn btn-sm"
                                    style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}
                                    onClick={() => handleStatusChange(leave.id, 'APPROVED')}
                                >
                                    <HiOutlineCheck /> Approve
                                </button>
                                <button
                                    className="btn btn-sm"
                                    style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                    onClick={() => handleStatusChange(leave.id, 'REJECTED')}
                                >
                                    <HiOutlineX /> Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Request Leave</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <HiOutlineX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Employee</label>
                                    <select
                                        className="form-select"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Leave Type</label>
                                    <select
                                        className="form-select"
                                        value={formData.leaveType}
                                        onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                    >
                                        {leaveTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Reason</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        rows="3"
                                        placeholder="Optional reason for leave..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveManagement;
