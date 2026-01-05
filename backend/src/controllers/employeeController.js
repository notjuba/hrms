const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all employees
const getAllEmployees = async (req, res, next) => {
    try {
        const { search, status, departmentId } = req.query;

        const where = {};

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { position: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (status) {
            where.status = status;
        }

        if (departmentId) {
            where.departmentId = parseInt(departmentId);
        }

        const employees = await prisma.employee.findMany({
            where,
            include: {
                department: true,
                user: { select: { email: true, role: true } }
            },
            orderBy: { lastName: 'asc' }
        });

        res.json(employees);
    } catch (error) {
        next(error);
    }
};

// Get single employee
const getEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(id) },
            include: {
                department: true,
                user: { select: { email: true, role: true } },
                salary: true,
                leaveRequests: { orderBy: { createdAt: 'desc' }, take: 5 },
                attendances: { orderBy: { date: 'desc' }, take: 10 }
            }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        next(error);
    }
};

// Create employee
const createEmployee = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phone, position, hireDate, address, departmentId, status } = req.body;

        // Build the data object for Prisma - use connect syntax for relations
        const data = {
            firstName,
            lastName,
            email,
            phone,
            position,
            hireDate: new Date(hireDate),
            address: address || null,
            status: status || 'ACTIVE',
            user: {
                create: {
                    email,
                    password: '$2a$10$placeholder', // Placeholder password
                    role: 'EMPLOYEE'
                }
            }
        };

        // Only connect department if departmentId is provided
        if (departmentId) {
            data.department = {
                connect: { id: parseInt(departmentId) }
            };
        }

        const employee = await prisma.employee.create({
            data,
            include: { department: true }
        });

        res.status(201).json(employee);
    } catch (error) {
        next(error);
    }
};

// Update employee
const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, position, hireDate, address, departmentId, status } = req.body;

        // Build the data object for Prisma - use connect/disconnect syntax for relations
        const data = {
            firstName,
            lastName,
            email,
            phone,
            position,
            hireDate: hireDate ? new Date(hireDate) : undefined,
            address,
            status
        };

        // Handle department relation
        if (departmentId) {
            data.department = {
                connect: { id: parseInt(departmentId) }
            };
        } else if (departmentId === null) {
            data.department = {
                disconnect: true
            };
        }

        const employee = await prisma.employee.update({
            where: { id: parseInt(id) },
            data,
            include: { department: true }
        });

        res.json(employee);
    } catch (error) {
        next(error);
    }
};

// Delete employee
const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employeeId = parseInt(id);

        // First, get the employee to find the userId
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: { userId: true }
        });

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Use a transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
            // First, remove this employee as manager from any departments they manage
            await tx.department.updateMany({
                where: { managerId: employeeId },
                data: { managerId: null }
            });

            // Delete the user (this will cascade delete the employee due to onDelete: Cascade)
            await tx.user.delete({
                where: { id: employee.userId }
            });
        });

        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
};
