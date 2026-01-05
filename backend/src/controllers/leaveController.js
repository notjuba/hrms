const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all leave requests
const getAllLeaves = async (req, res, next) => {
    try {
        const { status, employeeId } = req.query;

        const where = {};
        if (status) where.status = status;
        if (employeeId) where.employeeId = parseInt(employeeId);

        const leaves = await prisma.leaveRequest.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(leaves);
    } catch (error) {
        next(error);
    }
};

// Get single leave request
const getLeave = async (req, res, next) => {
    try {
        const { id } = req.params;

        const leave = await prisma.leaveRequest.findUnique({
            where: { id: parseInt(id) },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, department: true } }
            }
        });

        if (!leave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        res.json(leave);
    } catch (error) {
        next(error);
    }
};

// Create leave request
const createLeave = async (req, res, next) => {
    try {
        const { employeeId, leaveType, startDate, endDate, reason } = req.body;

        const leave = await prisma.leaveRequest.create({
            data: {
                employee: {
                    connect: { id: parseInt(employeeId) }
                },
                leaveType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        res.status(201).json(leave);
    } catch (error) {
        next(error);
    }
};

// Update leave request status
const updateLeaveStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const leave = await prisma.leaveRequest.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        res.json(leave);
    } catch (error) {
        next(error);
    }
};

// Delete leave request
const deleteLeave = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.leaveRequest.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Leave request deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllLeaves,
    getLeave,
    createLeave,
    updateLeaveStatus,
    deleteLeave
};
