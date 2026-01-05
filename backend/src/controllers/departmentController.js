const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all departments
const getAllDepartments = async (req, res, next) => {
    try {
        const departments = await prisma.department.findMany({
            include: {
                manager: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { employees: true } }
            },
            orderBy: { name: 'asc' }
        });

        res.json(departments);
    } catch (error) {
        next(error);
    }
};

// Get single department
const getDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const department = await prisma.department.findUnique({
            where: { id: parseInt(id) },
            include: {
                manager: { select: { id: true, firstName: true, lastName: true } },
                employees: {
                    select: { id: true, firstName: true, lastName: true, position: true, status: true }
                }
            }
        });

        if (!department) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json(department);
    } catch (error) {
        next(error);
    }
};

// Create department
const createDepartment = async (req, res, next) => {
    try {
        const { name, description, managerId } = req.body;

        // Build the data object for Prisma
        const data = {
            name,
            description
        };

        // Only connect manager if managerId is provided
        if (managerId) {
            data.manager = {
                connect: { id: parseInt(managerId) }
            };
        }

        const department = await prisma.department.create({
            data,
            include: {
                manager: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        res.status(201).json(department);
    } catch (error) {
        next(error);
    }
};

// Update department
const updateDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, managerId } = req.body;

        // Build the data object for Prisma
        const data = {
            name,
            description
        };

        // Handle manager relation
        // managerId can be: a valid ID (connect), empty string or null (disconnect), or undefined (no change)
        if (managerId && managerId !== '') {
            data.manager = {
                connect: { id: parseInt(managerId) }
            };
        } else if (managerId === '' || managerId === null) {
            // Disconnect manager when empty string or null is sent
            data.managerId = null;
        }

        const department = await prisma.department.update({
            where: { id: parseInt(id) },
            data,
            include: {
                manager: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        res.json(department);
    } catch (error) {
        next(error);
    }
};

// Delete department
const deleteDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.department.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
