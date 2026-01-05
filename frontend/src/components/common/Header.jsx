import { useLocation } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineBell } from 'react-icons/hi';
import './Header.css';

const Header = () => {
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        const titles = {
            '/': 'Dashboard',
            '/employees': 'Employees',
            '/departments': 'Departments',
            '/leaves': 'Leave Management',
            '/attendance': 'Attendance',
            '/payroll': 'Payroll'
        };
        return titles[path] || 'Dashboard';
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-title">{getPageTitle()}</h1>
                <span className="header-date">{today}</span>
            </div>

            <div className="header-right">
                <div className="search-box">
                    <HiOutlineSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                    />
                </div>

                <button className="btn btn-ghost btn-icon notification-btn">
                    <HiOutlineBell />
                    <span className="notification-badge">3</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
