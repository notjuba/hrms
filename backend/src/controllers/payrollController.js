const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all salaries
const getAllSalaries = async (req, res, next) => {
    try {
        const salaries = await prisma.salary.findMany({
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, position: true, department: true }
                }
            },
            orderBy: { employee: { lastName: 'asc' } }
        });

        res.json(salaries);
    } catch (error) {
        next(error);
    }
};

// Get salary by employee
const getSalaryByEmployee = async (req, res, next) => {
    try {
        const { employeeId } = req.params;

        const salary = await prisma.salary.findUnique({
            where: { employeeId: parseInt(employeeId) },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, position: true, department: true }
                }
            }
        });

        if (!salary) {
            return res.status(404).json({ error: 'Salary record not found' });
        }

        res.json(salary);
    } catch (error) {
        next(error);
    }
};

// Create or update salary
const upsertSalary = async (req, res, next) => {
    try {
        const { employeeId, baseSalary, bonus, deductions, currency } = req.body;

        const salary = await prisma.salary.upsert({
            where: { employeeId: parseInt(employeeId) },
            update: {
                baseSalary: parseFloat(baseSalary),
                bonus: bonus ? parseFloat(bonus) : 0,
                deductions: deductions ? parseFloat(deductions) : 0,
                currency: currency || 'EUR'
            },
            create: {
                employee: {
                    connect: { id: parseInt(employeeId) }
                },
                baseSalary: parseFloat(baseSalary),
                bonus: bonus ? parseFloat(bonus) : 0,
                deductions: deductions ? parseFloat(deductions) : 0,
                currency: currency || 'EUR'
            },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, position: true }
                }
            }
        });

        res.json(salary);
    } catch (error) {
        next(error);
    }
};

// Get payroll summary
const getPayrollSummary = async (req, res, next) => {
    try {
        const salaries = await prisma.salary.findMany({
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, position: true, department: true }
                }
            }
        });

        const summary = {
            totalEmployees: salaries.length,
            totalBaseSalary: salaries.reduce((sum, s) => sum + parseFloat(s.baseSalary), 0),
            totalBonus: salaries.reduce((sum, s) => sum + parseFloat(s.bonus), 0),
            totalDeductions: salaries.reduce((sum, s) => sum + parseFloat(s.deductions), 0),
            totalNet: salaries.reduce((sum, s) =>
                sum + parseFloat(s.baseSalary) + parseFloat(s.bonus) - parseFloat(s.deductions), 0
            ),
            salaries
        };

        res.json(summary);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllSalaries,
    getSalaryByEmployee,
    upsertSalary,
    getPayrollSummary
};
