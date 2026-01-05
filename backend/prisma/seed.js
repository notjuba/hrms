const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create departments
    const departments = await Promise.all([
        prisma.department.create({ data: { name: 'Engineering', description: 'Software development and IT' } }),
        prisma.department.create({ data: { name: 'Human Resources', description: 'HR and recruitment' } }),
        prisma.department.create({ data: { name: 'Finance', description: 'Accounting and financial planning' } }),
        prisma.department.create({ data: { name: 'Marketing', description: 'Marketing and communications' } }),
        prisma.department.create({ data: { name: 'Operations', description: 'Business operations' } })
    ]);

    console.log('✅ Created departments');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create admin user
    const admin = await prisma.user.create({
        data: {
            email: 'admin@hrms.com',
            password: hashedPassword,
            role: 'ADMIN',
            employee: {
                create: {
                    firstName: 'Admin',
                    lastName: 'User',
                    email: 'admin@hrms.com',
                    phone: '+1234567890',
                    position: 'System Administrator',
                    hireDate: new Date('2020-01-01'),
                    address: '123 Admin Street',
                    departmentId: departments[1].id
                }
            }
        },
        include: { employee: true }
    });

    console.log('✅ Created admin user');

    // Create HR Manager
    const hrManager = await prisma.user.create({
        data: {
            email: 'hr@hrms.com',
            password: hashedPassword,
            role: 'HR_MANAGER',
            employee: {
                create: {
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    email: 'hr@hrms.com',
                    phone: '+1234567891',
                    position: 'HR Manager',
                    hireDate: new Date('2021-03-15'),
                    address: '456 HR Avenue',
                    departmentId: departments[1].id
                }
            }
        },
        include: { employee: true }
    });

    // Update HR department manager
    await prisma.department.update({
        where: { id: departments[1].id },
        data: { managerId: hrManager.employee.id }
    });

    console.log('✅ Created HR manager');

    // Create sample employees
    const employees = [
        { firstName: 'John', lastName: 'Doe', email: 'john.doe@hrms.com', position: 'Senior Developer', deptIdx: 0 },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@hrms.com', position: 'Frontend Developer', deptIdx: 0 },
        { firstName: 'Mike', lastName: 'Brown', email: 'mike.brown@hrms.com', position: 'Backend Developer', deptIdx: 0 },
        { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@hrms.com', position: 'Financial Analyst', deptIdx: 2 },
        { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@hrms.com', position: 'Marketing Specialist', deptIdx: 3 },
        { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.anderson@hrms.com', position: 'Operations Manager', deptIdx: 4 },
        { firstName: 'Tom', lastName: 'Taylor', email: 'tom.taylor@hrms.com', position: 'DevOps Engineer', deptIdx: 0 },
        { firstName: 'Anna', lastName: 'Martinez', email: 'anna.martinez@hrms.com', position: 'UX Designer', deptIdx: 0 }
    ];

    for (const emp of employees) {
        await prisma.user.create({
            data: {
                email: emp.email,
                password: hashedPassword,
                role: 'EMPLOYEE',
                employee: {
                    create: {
                        firstName: emp.firstName,
                        lastName: emp.lastName,
                        email: emp.email,
                        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                        position: emp.position,
                        hireDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                        address: `${Math.floor(Math.random() * 999) + 1} ${emp.lastName} Street`,
                        departmentId: departments[emp.deptIdx].id
                    }
                }
            }
        });
    }

    console.log('✅ Created sample employees');

    // Get all employees for creating related data
    const allEmployees = await prisma.employee.findMany();

    // Create salaries
    for (const emp of allEmployees) {
        await prisma.salary.create({
            data: {
                employeeId: emp.id,
                baseSalary: Math.floor(Math.random() * 50000) + 40000,
                bonus: Math.floor(Math.random() * 5000),
                deductions: Math.floor(Math.random() * 2000),
                currency: 'EUR'
            }
        });
    }

    console.log('✅ Created salary records');

    // Create some leave requests
    const leaveTypes = ['ANNUAL', 'SICK', 'PERSONAL'];
    const leaveStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

    for (let i = 0; i < 10; i++) {
        const emp = allEmployees[Math.floor(Math.random() * allEmployees.length)];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);

        await prisma.leaveRequest.create({
            data: {
                employeeId: emp.id,
                leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
                startDate,
                endDate,
                status: leaveStatuses[Math.floor(Math.random() * leaveStatuses.length)],
                reason: 'Sample leave request'
            }
        });
    }

    console.log('✅ Created leave requests');

    // Create attendance records for past 7 days
    const attendanceStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT'];

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
        const date = new Date();
        date.setDate(date.getDate() - dayOffset);
        date.setHours(0, 0, 0, 0);

        for (const emp of allEmployees) {
            if (Math.random() > 0.1) { // 90% attendance rate
                const checkIn = new Date(date);
                checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));

                const checkOut = new Date(date);
                checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));

                await prisma.attendance.create({
                    data: {
                        employeeId: emp.id,
                        date,
                        checkIn,
                        checkOut,
                        status: attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)]
                    }
                });
            }
        }
    }

    console.log('✅ Created attendance records');
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test credentials:');
    console.log('   Admin: admin@hrms.com / password123');
    console.log('   HR Manager: hr@hrms.com / password123');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
