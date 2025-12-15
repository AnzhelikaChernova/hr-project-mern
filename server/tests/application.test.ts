import { User, Vacancy, Application } from '../src/models';

describe('Application Model', () => {
  let hrUser: typeof User.prototype;
  let candidate: typeof User.prototype;
  let vacancy: typeof Vacancy.prototype;

  beforeEach(async () => {
    hrUser = await User.create({
      email: 'hr@test.com',
      password: 'password123',
      firstName: 'HR',
      lastName: 'Manager',
      role: 'HR',
    });

    candidate = await User.create({
      email: 'candidate@test.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Candidate',
      role: 'CANDIDATE',
      skills: ['JavaScript', 'React'],
    });

    vacancy = await Vacancy.create({
      title: 'Frontend Developer',
      description: 'Join our team',
      requirements: ['React', 'TypeScript'],
      salary: { min: 80000, max: 120000, currency: 'USD' },
      location: 'Remote',
      type: 'REMOTE',
      status: 'OPEN',
      department: 'Engineering',
      createdBy: hrUser._id,
    });
  });

  it('should create an application with valid data', async () => {
    const application = await Application.create({
      vacancy: vacancy._id,
      candidate: candidate._id,
      resume: 'https://example.com/resume.pdf',
      coverLetter: 'I am interested in this position.',
    });

    expect(application._id).toBeDefined();
    expect(application.status).toBe('PENDING');
    expect(application.isDeleted).toBe(false);
  });

  it('should not allow duplicate applications', async () => {
    await Application.create({
      vacancy: vacancy._id,
      candidate: candidate._id,
      resume: 'https://example.com/resume.pdf',
    });

    await expect(
      Application.create({
        vacancy: vacancy._id,
        candidate: candidate._id,
        resume: 'https://example.com/resume2.pdf',
      })
    ).rejects.toThrow();
  });

  it('should find applications by vacancy', async () => {
    await Application.create({
      vacancy: vacancy._id,
      candidate: candidate._id,
      resume: 'https://example.com/resume.pdf',
    });

    const applications = await Application.findByVacancy(vacancy._id.toString());
    expect(applications.length).toBe(1);
    expect(applications[0].vacancy.toString()).toBe(vacancy._id.toString());
  });

  it('should find applications by candidate', async () => {
    await Application.create({
      vacancy: vacancy._id,
      candidate: candidate._id,
      resume: 'https://example.com/resume.pdf',
    });

    const applications = await Application.findByCandidate(candidate._id.toString());
    expect(applications.length).toBe(1);
    expect(applications[0].candidate.toString()).toBe(candidate._id.toString());
  });

  it('should not include deleted applications', async () => {
    await Application.create({
      vacancy: vacancy._id,
      candidate: candidate._id,
      resume: 'https://example.com/resume.pdf',
      isDeleted: true,
    });

    const applications = await Application.findByVacancy(vacancy._id.toString());
    expect(applications.length).toBe(0);
  });

  it('should update application status', async () => {
    const application = await Application.create({
      vacancy: vacancy._id,
      candidate: candidate._id,
      resume: 'https://example.com/resume.pdf',
    });

    application.status = 'REVIEWING';
    await application.save();

    const updated = await Application.findById(application._id);
    expect(updated?.status).toBe('REVIEWING');
  });
});
