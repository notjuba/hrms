const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get attendance records
const getAttendance = async (req, res, next) => {
    try {
        const { date, employeeId, startDate, endDate } = req.query;

        const where = {};

        if (employeeId) {
            where.employeeId = parseInt(employeeId);
        }

        if (date) {
            where.date = new Date(date);
        } else if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } }
            },
            orderBy: [{ date: 'desc' }, { checkIn: 'desc' }]
        });

        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

// Check in
const checkIn = async (req, res, next) => {
    try {
        const { employeeId } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const existing = await prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId: parseInt(employeeId),
                    date: today
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        const now = new Date();
        const isLate = now.getHours() >= 9; // After 9 AM is late

        const attendance = await prisma.attendance.create({
            data: {
                employee: {
                    connect: { id: parseInt(employeeId) }
                },
                date: today,
                checkIn: now,
                status: isLate ? 'LATE' : 'PRESENT'
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        res.status(201).json(attendance);
    } catch (error) {
        next(error);
    }
};

// Check out
const checkOut = async (req, res, next) => {
    try {
        const { employeeId } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.update({
            where: {
                employeeId_date: {
                    employeeId: parseInt(employeeId),
                    date: today
                }
            },
            data: {
                checkOut: new Date()
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

// Create/Update attendance record manually
const upsertAttendance = async (req, res, next) => {
    try {
        const { employeeId, date, checkIn, checkOut, status, notes } = req.body;
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId: parseInt(employeeId),
                    date: attendanceDate
                }
            },
            update: {
                checkIn: checkIn ? new Date(checkIn) : undefined,
                checkOut: checkOut ? new Date(checkOut) : undefined,
                status,
                notes
            },
            create: {
                employee: {
                    connect: { id: parseInt(employeeId) }
                },
                date: attendanceDate,
                checkIn: checkIn ? new Date(checkIn) : null,
                checkOut: checkOut ? new Date(checkOut) : null,
                status: status || 'PRESENT',
                notes
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } }
            }
        });

        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAttendance,
    checkIn,
    checkOut,
    upsertAttendance
};
