import { User, Vacancy } from '../src/models';
import mongoose from 'mongoose';

describe('Vacancy Model', () => {
  let hrUser: typeof User.prototype;

  beforeEach(async () => {
    hrUser = await User.create({
      email: 'hr@test.com',
      password: 'password123',
      firstName: 'HR',
      lastName: 'Manager',
      role: 'HR',
    });
  });

  it('should create a vacancy with valid data', async () => {
    const vacancyData = {
      title: 'Software Engineer',
      description: 'We are looking for a skilled engineer',
      requirements: ['React', 'Node.js', 'TypeScript'],
      salary: { min: 80000, max: 120000, currency: 'USD' },
      location: 'San Francisco, CA',
      type: 'FULL_TIME' as const,
      department: 'Engineering',
      createdBy: hrUser._id,
    };

    const vacancy = await Vacancy.create(vacancyData);

    expect(vacancy._id).toBeDefined();
    expect(vacancy.title).toBe(vacancyData.title);
    expect(vacancy.status).toBe('DRAFT');
    expect(vacancy.isDeleted).toBe(false);
  });

  it('should require at least one requirement', async () => {
    const vacancyData = {
      title: 'Software Engineer',
      description: 'We are looking for a skilled engineer',
      requirements: [],
      salary: { min: 80000, max: 120000, currency: 'USD' },
      location: 'San Francisco, CA',
      type: 'FULL_TIME',
      department: 'Engineering',
      createdBy: hrUser._id,
    };

    await expect(Vacancy.create(vacancyData)).rejects.toThrow();
  });

  it('should validate salary max >= min', async () => {
    const vacancyData = {
      title: 'Software Engineer',
      description: 'Description',
      requirements: ['Skill'],
      salary: { min: 120000, max: 80000, currency: 'USD' },
      location: 'San Francisco, CA',
      type: 'FULL_TIME',
      department: 'Engineering',
      createdBy: hrUser._id,
    };

    await expect(Vacancy.create(vacancyData)).rejects.toThrow();
  });

  it('should find active vacancies', async () => {
    await Vacancy.create({
      title: 'Active Job',
      description: 'Description',
      requirements: ['Skill'],
      salary: { min: 80000, max: 120000, currency: 'USD' },
      location: 'Location',
      type: 'FULL_TIME',
      status: 'OPEN',
      department: 'Engineering',
      createdBy: hrUser._id,
    });

    await Vacancy.create({
      title: 'Closed Job',
      description: 'Description',
      requirements: ['Skill'],
      salary: { min: 80000, max: 120000, currency: 'USD' },
      location: 'Location',
      type: 'FULL_TIME',
      status: 'CLOSED',
      department: 'Engineering',
      createdBy: hrUser._id,
    });

    const activeVacancies = await Vacancy.findActive();
    expect(activeVacancies.length).toBe(1);
    expect(activeVacancies[0].title).toBe('Active Job');
  });

  it('should not include deleted vacancies in findActive', async () => {
    await Vacancy.create({
      title: 'Deleted Job',
      description: 'Description',
      requirements: ['Skill'],
      salary: { min: 80000, max: 120000, currency: 'USD' },
      location: 'Location',
      type: 'FULL_TIME',
      status: 'OPEN',
      department: 'Engineering',
      createdBy: hrUser._id,
      isDeleted: true,
    });

    const activeVacancies = await Vacancy.findActive();
    expect(activeVacancies.length).toBe(0);
  });
});
