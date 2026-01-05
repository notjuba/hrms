import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineUsers } from 'react-icons/hi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Departments.css';

const Departments = () => {
    const { isHRManager } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        managerId: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [deptRes, empRes] = await Promise.all([
                api.get('/departments'),
                api.get('/employees')
            ]);
            setDepartments(deptRes.data);
            setEmployees(empRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({
                name: dept.name,
                description: dept.description || '',
                // Get manager ID from the nested manager object if it exists
                managerId: dept.manager?.id ? String(dept.manager.id) : ''
            });
        } else {
            setEditingDept(null);
            setFormData({ name: '', description: '', managerId: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDept) {
                await api.put(`/departments/${editingDept.id}`, formData);
            } else {
                await api.post('/departments', formData);
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this department?')) {
            try {
                await api.delete(`/departments/${id}`);
                loadData();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><div className="spinner"></div></div>;
    }

    return (
        <div className="departments-page">
            <div className="page-header">
                <h2 className="page-subtitle">{departments.length} Departments</h2>
                {isHRManager && (
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <HiOutlinePlus /> Add Department
                    </button>
                )}
            </div>

            <div className="departments-grid">
                {departments.map((dept) => (
                    <div key={dept.id} className="department-card glass-card">
                        <div className="dept-header">
                            <div className="dept-icon">
                                <HiOutlineUsers />
                            </div>
                            {isHRManager && (
                                <div className="dept-actions">
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openModal(dept)}>
                                        <HiOutlinePencil />
                                    </button>
                                    <button className="btn btn-ghost btn-icon btn-sm text-error" onClick={() => handleDelete(dept.id)}>
                                        <HiOutlineTrash />
                                    </button>
                                </div>
                            )}
                        </div>
                        <h3 className="dept-name">{dept.name}</h3>
                        <p className="dept-description">{dept.description || 'No description'}</p>
                        <div className="dept-stats">
                            <div className="dept-stat">
                                <span className="stat-value">{dept._count?.employees || 0}</span>
                                <span className="stat-label">Employees</span>
                            </div>
                            <div className="dept-stat">
                                <span className="stat-value">{dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : '-'}</span>
                                <span className="stat-label">Manager</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingDept ? 'Edit Department' : 'Add Department'}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <HiOutlineX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Department Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Manager</label>
                                    <select
                                        className="form-select"
                                        value={formData.managerId}
                                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                    >
                                        <option value="">No Manager</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingDept ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
