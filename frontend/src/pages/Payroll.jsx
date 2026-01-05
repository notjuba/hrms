import { useState, useEffect } from 'react';
import { HiOutlineCurrencyDollar, HiOutlineTrendingUp, HiOutlineTrendingDown } from 'react-icons/hi';
import api from '../services/api';
import './Payroll.css';

const Payroll = () => {
    const [payrollData, setPayrollData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await api.get('/payroll/summary');
            setPayrollData(response.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><div className="spinner"></div></div>;
    }

    const summaryCards = [
        { icon: HiOutlineCurrencyDollar, label: 'Total Base Salary', value: formatCurrency(payrollData?.totalBaseSalary || 0), color: '#6172f3' },
        { icon: HiOutlineTrendingUp, label: 'Total Bonuses', value: formatCurrency(payrollData?.totalBonus || 0), color: '#10b981' },
        { icon: HiOutlineTrendingDown, label: 'Total Deductions', value: formatCurrency(payrollData?.totalDeductions || 0), color: '#ef4444' },
        { icon: HiOutlineCurrencyDollar, label: 'Net Payroll', value: formatCurrency(payrollData?.totalNet || 0), color: '#a855f7' }
    ];

    return (
        <div className="payroll-page">
            {/* Summary Cards */}
            <div className="summary-grid">
                {summaryCards.map((card, index) => (
                    <div key={index} className="summary-card glass-card">
                        <div className="summary-icon" style={{ background: `${card.color}20`, color: card.color }}>
                            <card.icon />
                        </div>
                        <div className="summary-content">
                            <span className="summary-value">{card.value}</span>
                            <span className="summary-label">{card.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Salary Table */}
            <div className="table-section glass-card">
                <h3 className="section-title">Employee Salaries</h3>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Position</th>
                                <th>Department</th>
                                <th>Base Salary</th>
                                <th>Bonus</th>
                                <th>Deductions</th>
                                <th>Net Salary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollData?.salaries?.map((salary) => (
                                <tr key={salary.id}>
                                    <td>
                                        <div className="employee-cell">
                                            <div className="avatar avatar-sm">
                                                {salary.employee.firstName[0]}{salary.employee.lastName[0]}
                                            </div>
                                            <span>{salary.employee.firstName} {salary.employee.lastName}</span>
                                        </div>
                                    </td>
                                    <td>{salary.employee.position}</td>
                                    <td>{salary.employee.department?.name || '-'}</td>
                                    <td>{formatCurrency(salary.baseSalary)}</td>
                                    <td className="text-success">+{formatCurrency(salary.bonus)}</td>
                                    <td className="text-error">-{formatCurrency(salary.deductions)}</td>
                                    <td className="net-salary">
                                        {formatCurrency(parseFloat(salary.baseSalary) + parseFloat(salary.bonus) - parseFloat(salary.deductions))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payroll;
