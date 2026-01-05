import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Employees.css';

const Employees = () => {
    const { isHRManager } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        hireDate: '',
        address: '',
        departmentId: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [empRes, deptRes] = await Promise.all([
                api.get('/employees'),
                api.get('/departments')
            ]);
            setEmployees(empRes.data);
            setDepartments(deptRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                phone: employee.phone || '',
                position: employee.position,
                hireDate: employee.hireDate.split('T')[0],
                address: employee.address || '',
                departmentId: employee.departmentId || '',
                status: employee.status
            });
        } else {
            setEditingEmployee(null);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                position: '',
                hireDate: new Date().toISOString().split('T')[0],
                address: '',
                departmentId: '',
                status: 'ACTIVE'
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEmployee) {
                await api.put(`/employees/${editingEmployee.id}`, formData);
            } else {
                await api.post('/employees', formData);
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this employee?')) {
            try {
                await api.delete(`/employees/${id}`);
                loadData();
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.position}`.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center h-full"><div className="spinner"></div></div>;
    }

    return (
        <div className="employees-page">
            <div className="page-header">
                <div className="header-left">
                    <div className="search-box">
                        <HiOutlineSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
                {isHRManager && (
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        <HiOutlinePlus /> Add Employee
                    </button>
                )}
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Position</th>
                            <th>Department</th>
                            <th>Email</th>
                            <th>Status</th>
                            {isHRManager && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((emp) => (
                            <tr key={emp.id}>
                                <td>
                                    <div className="employee-cell">
                                        <div className="avatar">
                                            {emp.firstName[0]}{emp.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="employee-name">{emp.firstName} {emp.lastName}</div>
                                            <div className="employee-date">Hired {new Date(emp.hireDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{emp.position}</td>
                                <td>{emp.department?.name || '-'}</td>
                                <td>{emp.email}</td>
                                <td>
                                    <span className={`badge badge-${emp.status === 'ACTIVE' ? 'success' : emp.status === 'ON_LEAVE' ? 'warning' : 'error'}`}>
                                        {emp.status.replace('_', ' ')}
                                    </span>
                                </td>
                                {isHRManager && (
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn btn-ghost btn-icon" onClick={() => openModal(emp)}>
                                                <HiOutlinePencil />
                                            </button>
                                            <button className="btn btn-ghost btn-icon text-error" onClick={() => handleDelete(emp.id)}>
                                                <HiOutlineTrash />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <HiOutlineX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Position</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <select
                                            className="form-select"
                                            value={formData.departmentId}
                                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        >
                                            <option value="">No Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Hire Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.hireDate}
                                            onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="ON_LEAVE">On Leave</option>
                                        <option value="TERMINATED">Terminated</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingEmployee ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
