const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get dashboard statistics
const getStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Employee counts
        const totalEmployees = await prisma.employee.count();
        const activeEmployees = await prisma.employee.count({ where: { status: 'ACTIVE' } });

        // Department count
        const totalDepartments = await prisma.department.count();

        // Pending leave requests
        const pendingLeaves = await prisma.leaveRequest.count({ where: { status: 'PENDING' } });

        // Today's attendance
        const todayPresent = await prisma.attendance.count({
            where: { date: today, status: { in: ['PRESENT', 'LATE'] } }
        });

        // Recent hires (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentHires = await prisma.employee.count({
            where: { hireDate: { gte: thirtyDaysAgo } }
        });

        // Employees by department
        const employeesByDept = await prisma.department.findMany({
            select: {
                name: true,
                _count: { select: { employees: true } }
            }
        });

        // Attendance trend (last 7 days)
        const attendanceTrend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const count = await prisma.attendance.count({
                where: { date, status: { in: ['PRESENT', 'LATE'] } }
            });

            attendanceTrend.push({
                date: date.toISOString().split('T')[0],
                count
            });
        }

        // Recent leaves
        const recentLeaves = await prisma.leaveRequest.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });

        res.json({
            stats: {
                totalEmployees,
                activeEmployees,
                totalDepartments,
                pendingLeaves,
                todayPresent,
                recentHires
            },
            employeesByDept: employeesByDept.map(d => ({
                name: d.name,
                count: d._count.employees
            })),
            attendanceTrend,
            recentLeaves
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStats };
