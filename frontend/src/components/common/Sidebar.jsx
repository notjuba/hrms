import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineOfficeBuilding,
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineCurrencyDollar,
    HiOutlineLogout
} from 'react-icons/hi';
import './Sidebar.css';

const Sidebar = () => {
    const { logout, user } = useAuth();

    const navItems = [
        { path: '/', icon: HiOutlineHome, label: 'Dashboard' },
        { path: '/employees', icon: HiOutlineUsers, label: 'Employees' },
        { path: '/departments', icon: HiOutlineOfficeBuilding, label: 'Departments' },
        { path: '/leaves', icon: HiOutlineCalendar, label: 'Leave Management' },
        { path: '/attendance', icon: HiOutlineClock, label: 'Attendance' },
        { path: '/payroll', icon: HiOutlineCurrencyDollar, label: 'Payroll' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">HR</div>
                    <span className="logo-text">ERP<span className="logo-accent">.</span></span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section-label">>>> Navigation</div>
                <ul className="nav-list">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                end={item.path === '/'}
                            >
                                <item.icon className="nav-icon" />
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">
                        {user?.employee?.firstName?.[0] || 'U'}
                        {user?.employee?.lastName?.[0] || ''}
                    </div>
                    <div className="user-details">
                        <span className="user-name">
                            {user?.employee?.firstName} {user?.employee?.lastName}
                        </span>
                        <span className="user-role">{user?.role?.replace('_', ' ')}</span>
                    </div>
                </div>
                <button className="btn btn-ghost btn-icon logout-btn" onClick={logout} title="Logout">
                    <HiOutlineLogout />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
