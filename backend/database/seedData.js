// database/seedData.js
// ⚠️  WARNING: PRODUCTION DATA SEEDING IS DISABLED
// This file is for DEVELOPMENT ONLY
// DO NOT run this in production - it will delete all data!

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Performance from '../models/Performance.js';
import Reward from '../models/Reward.js';
import Feedback from '../models/Feedback.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedData = async () => {
  // PRODUCTION SAFETY CHECK
  if (process.env.NODE_ENV === 'production') {
    console.error(`
╔════════════════════════════════════════════════════════════╗
║           ❌ SEEDING BLOCKED IN PRODUCTION ❌               ║
╠════════════════════════════════════════════════════════════╣
║ Seed data operations are DISABLED in production mode.     ║
║ This is a safety feature to prevent data loss.             ║
║                                                            ║
║ To seed data:                                              ║
║ 1. Set NODE_ENV=development in .env                        ║
║ 2. Ensure MONGODB_URI points to DEVELOPMENT database       ║
║ 3. Run: npm run seed                                       ║
║                                                            ║
║ NEVER run seeding against production database!            ║
╚════════════════════════════════════════════════════════════╝
    `);
    process.exit(1);
  }

  try {
    console.warn('⚠️  WARNING: Running seed data (DEVELOPMENT ONLY)');
    console.warn('⚠️  This will DELETE ALL existing data!');
    
    await connectDB();
    console.log('✓ Database connected');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    await Performance.deleteMany({});
    await Reward.deleteMany({});
    await Feedback.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create Admin User
    const adminUser = await User.create({
      email: 'admin@hrm.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('✓ Admin user created:', adminUser.email);

    // Create HR Manager User
    const hrUser = await User.create({
      email: 'hr@hrm.com',
      password: 'hr123',
      role: 'hr_manager',
      isEmailVerified: true,
    });

    // Create HR Manager Employee
    const hrEmployee = await Employee.create({
      userId: hrUser._id,
      employeeId: 'EMP-HR-001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'hr@hrm.com',
      phone: '+1-555-0100',
      department: 'Human Resources',
      position: 'HR Manager',
      joiningDate: new Date('2022-01-15'),
      status: 'active',
      rewardPoints: 450,
      totalBonus: 15000,
      attendancePercentage: 98,
      performanceScore: 4.5,
      badges: ['high_attendance', 'high_productivity'],
    });
    console.log('✓ HR Manager created');

    // Create Sample Employees
    const employeeData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@hrm.com',
        password: 'john123',
        phone: '+1-555-0101',
        department: 'Information Technology',
        position: 'Senior Developer',
        joiningDate: new Date('2021-03-20'),
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@hrm.com',
        password: 'jane123',
        phone: '+1-555-0102',
        department: 'Marketing',
        position: 'Marketing Manager',
        joiningDate: new Date('2021-06-10'),
      },
      {
        firstName: 'Mike',
        lastName: 'Wilson',
        email: 'mike.wilson@hrm.com',
        password: 'mike123',
        phone: '+1-555-0103',
        department: 'Sales',
        position: 'Sales Executive',
        joiningDate: new Date('2022-02-01'),
      },
      {
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@hrm.com',
        password: 'emma123',
        phone: '+1-555-0104',
        department: 'Information Technology',
        position: 'QA Engineer',
        joiningDate: new Date('2021-09-15'),
      },
    ];

    const employees = [];

    for (const data of employeeData) {
      const user = await User.create({
        email: data.email,
        password: data.password,
        role: 'employee',
        isEmailVerified: true,
      });

      const employee = await Employee.create({
        userId: user._id,
        employeeId: `EMP-${employees.length + 1001}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        department: data.department,
        position: data.position,
        joiningDate: data.joiningDate,
        status: 'active',
        rewardPoints: Math.floor(Math.random() * 500),
        totalBonus: Math.floor(Math.random() * 20000),
        attendancePercentage: Math.floor(Math.random() * 30) + 70,
        performanceScore: (Math.random() * 2 + 3).toFixed(1),
        badges: ['high_attendance', 'high_productivity'].slice(0, Math.floor(Math.random() * 3)),
        manager: hrEmployee._id,
      });

      employees.push(employee);
    }

    console.log(`✓ ${employees.length} employees created`);

    // Create Sample Attendance Records
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    for (const employee of employees) {
      for (let i = 0; i < 20; i++) {
        const date = new Date(startOfMonth);
        date.setDate(startOfMonth.getDate() + i);

        if (date.getDay() !== 0 && date.getDay() !== 6) {
          // Skip weekends
          const checkInTime = new Date(date);
          checkInTime.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);

          const checkOutTime = new Date(date);
          checkOutTime.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);

          const status = Math.random() > 0.1 ? 'present' : 'absent';

          await Attendance.create({
            employeeId: employee._id,
            date: date,
            checkInTime: status === 'present' ? checkInTime : null,
            checkOutTime: status === 'present' ? checkOutTime : null,
            totalHours: status === 'present' ? 8 : 0,
            status,
            isLate: false,
          });
        }
      }
    }

    console.log('✓ Attendance records created');

    // Create Sample Performance Reviews
    for (const employee of employees) {
      const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth(), 0);

      await Performance.create({
        employeeId: employee._id,
        reviewPeriod: {
          startDate,
          endDate,
        },
        taskCompletionRate: Math.floor(Math.random() * 30) + 70,
        productivityScore: (Math.random() * 2 + 3).toFixed(1),
        teamCollaborationScore: (Math.random() * 2 + 3).toFixed(1),
        monthlyRating: Math.floor(Math.random() * 2) + 3,
        overallPerformance: (Math.random() * 2 + 3).toFixed(1),
        reviewedBy: hrEmployee._id,
        managerFeedback: 'Good performance this month. Keep it up!',
        strengths: ['Communication', 'Problem Solving'],
        improvementAreas: ['Time Management'],
      });
    }

    console.log('✓ Performance reviews created');

    // Create Sample Rewards
    for (const employee of employees) {
      const rewardTypes = ['points', 'bonus', 'badge'];
      const randomType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];

      await Reward.create({
        employeeId: employee._id,
        rewardType: randomType,
        points: randomType === 'points' ? 100 : 0,
        bonus: randomType === 'bonus' ? 5000 : 0,
        badge: randomType === 'badge' ? 'high_productivity' : null,
        reason: 'Outstanding performance and dedication',
        criteria: ['High productivity', 'Team collaboration'],
        awardedBy: hrEmployee._id,
        approvedBy: hrEmployee._id,
        approvalStatus: 'approved',
        month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
      });
    }

    console.log('✓ Rewards created');

    // Create Sample Feedback
    for (let i = 0; i < employees.length; i++) {
      const sender = employees[(i + 1) % employees.length];
      const receiver = employees[i];

      await Feedback.create({
        sender: sender._id,
        receiver: receiver._id,
        feedbackType: 'peer_review',
        rating: Math.floor(Math.random() * 2) + 3,
        comment: 'Great work on the recent project. Very collaborative and professional.',
        category: 'collaboration',
        isPositive: true,
      });
    }

    console.log('✓ Feedback records created');

    console.log(`
╔════════════════════════════════════╗
║   SEED DATA CREATED SUCCESSFULLY   ║
╠════════════════════════════════════╣
║ Admin: admin@hrm.com / admin123    ║
║ HR: hr@hrm.com / hr123             ║
║ Sample Employees created with      ║
║ password format: firstname123      ║
║ (e.g., john.doe@hrm.com/john123)   ║
╚════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('✗ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
