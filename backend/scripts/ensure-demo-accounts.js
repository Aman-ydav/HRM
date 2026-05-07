import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

dotenv.config();

const accounts = [
  {
    email: 'admin@hrm.com',
    password: 'admin123',
    role: 'admin',
    employee: null,
  },
  {
    email: 'hr@hrm.com',
    password: 'hr12345',
    role: 'hr_manager',
    employee: {
      employeeId: 'EMP-HR-001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      department: 'Human Resources',
      position: 'HR Manager',
      phone: '+1-555-0100',
      joiningDate: new Date('2022-01-15'),
      status: 'active',
      rewardPoints: 450,
      totalBonus: 15000,
      attendancePercentage: 97,
      performanceScore: 4.4,
      badges: ['team_player', 'leader'],
    },
  },
  {
    email: 'john.doe@hrm.com',
    password: 'john123',
    role: 'employee',
    employee: {
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      department: 'Information Technology',
      position: 'Senior Developer',
      phone: '+1-555-0101',
      joiningDate: new Date('2023-03-20'),
      status: 'active',
      rewardPoints: 220,
      totalBonus: 5000,
      attendancePercentage: 93,
      performanceScore: 4.1,
      badges: ['high_productivity'],
    },
  },
];

const upsertUser = async (account) => {
  let user = await User.findOne({ email: account.email }).select('+password');
  if (!user) {
    user = new User({
      email: account.email,
      password: account.password,
      role: account.role,
      isEmailVerified: true,
      isActive: true,
    });
  } else {
    user.role = account.role;
    user.isActive = true;
    user.isEmailVerified = true;
    user.password = account.password;
  }

  await user.save();
  return user;
};

const upsertEmployee = async (user, account, managerId = null) => {
  if (!account.employee) {
    return null;
  }

  let employee = await Employee.findOne({ userId: user._id });

  if (!employee) {
    const existingByCode = await Employee.findOne({ employeeId: account.employee.employeeId });
    if (existingByCode && existingByCode.userId.toString() !== user._id.toString()) {
      throw new Error(
        `Employee ID ${account.employee.employeeId} is already used by another user.`
      );
    }
    employee = new Employee({ userId: user._id });
  }

  employee.employeeId = account.employee.employeeId;
  employee.firstName = account.employee.firstName;
  employee.lastName = account.employee.lastName;
  employee.email = account.email;
  employee.phone = account.employee.phone;
  employee.department = account.employee.department;
  employee.position = account.employee.position;
  employee.joiningDate = account.employee.joiningDate;
  employee.status = account.employee.status;
  employee.rewardPoints = account.employee.rewardPoints;
  employee.totalBonus = account.employee.totalBonus;
  employee.attendancePercentage = account.employee.attendancePercentage;
  employee.performanceScore = account.employee.performanceScore;
  employee.badges = account.employee.badges;

  if (account.role === 'employee' && managerId) {
    employee.manager = managerId;
    employee.reportingTo = managerId;
  } else if (account.role === 'hr_manager') {
    employee.manager = null;
    employee.reportingTo = null;
  }

  await employee.save();
  return employee;
};

const run = async () => {
  try {
    await connectDB();

    const createdUsers = {};
    for (const account of accounts) {
      createdUsers[account.email] = await upsertUser(account);
    }

    const hrUser = createdUsers['hr@hrm.com'];
    const hrAccount = accounts.find((account) => account.email === 'hr@hrm.com');
    const hrEmployee = await upsertEmployee(hrUser, hrAccount);

    for (const account of accounts) {
      if (!account.employee || account.email === 'hr@hrm.com') {
        continue;
      }

      const user = createdUsers[account.email];
      await upsertEmployee(user, account, hrEmployee?._id || null);
    }

    console.log('Demo accounts ensured successfully:');
    console.log('admin@hrm.com / admin123');
    console.log('hr@hrm.com / hr12345');
    console.log('john.doe@hrm.com / john123');
  } catch (error) {
    console.error('Failed to ensure demo accounts:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
