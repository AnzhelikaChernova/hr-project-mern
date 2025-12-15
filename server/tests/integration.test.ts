import { User, Vacancy, Application, Interview, Feedback } from '../src/models';

describe('Integration Tests', () => {
  describe('Full Recruitment Flow', () => {
    it('should complete a full recruitment process', async () => {
      const hr = await User.create({
        email: 'hr@company.com',
        password: 'password123',
        firstName: 'Anna',
        lastName: 'HR',
        role: 'HR',
        company: 'TechCorp',
      });

      const candidate = await User.create({
        email: 'candidate@email.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Developer',
        role: 'CANDIDATE',
        skills: ['React', 'Node.js'],
      });

      const vacancy = await Vacancy.create({
        title: 'Full Stack Developer',
        description: 'We need a talented developer',
        requirements: ['React', 'Node.js', 'TypeScript'],
        salary: { min: 100000, max: 150000, currency: 'USD' },
        location: 'Remote',
        type: 'REMOTE',
        status: 'OPEN',
        department: 'Engineering',
        createdBy: hr._id,
      });

      expect(vacancy.status).toBe('OPEN');

      const application = await Application.create({
        vacancy: vacancy._id,
        candidate: candidate._id,
        resume: 'https://example.com/john-resume.pdf',
        coverLetter: 'I am very interested in this position.',
      });

      expect(application.status).toBe('PENDING');

      application.status = 'REVIEWING';
      await application.save();
      expect(application.status).toBe('REVIEWING');

      application.status = 'INTERVIEW';
      await application.save();

      const interview = await Interview.create({
        application: application._id,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        duration: 60,
        type: 'VIDEO',
        location: 'https://meet.google.com/abc-xyz',
        interviewers: [hr._id],
      });

      expect(interview.status).toBe('SCHEDULED');

      interview.status = 'COMPLETED';
      await interview.save();

      const feedback = await Feedback.create({
        interview: interview._id,
        author: hr._id,
        rating: 5,
        technicalSkills: 5,
        communication: 4,
        cultureFit: 5,
        comments: 'Excellent candidate with strong technical skills.',
        recommendation: 'HIRE',
      });

      expect(feedback.recommendation).toBe('HIRE');

      application.status = 'OFFERED';
      await application.save();

      application.status = 'ACCEPTED';
      await application.save();

      vacancy.status = 'CLOSED';
      await vacancy.save();

      const finalApplication = await Application.findById(application._id);
      const finalVacancy = await Vacancy.findById(vacancy._id);

      expect(finalApplication?.status).toBe('ACCEPTED');
      expect(finalVacancy?.status).toBe('CLOSED');
    });

    it('should handle multiple candidates for one vacancy', async () => {
      const hr = await User.create({
        email: 'recruiter@company.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Recruiter',
        role: 'HR',
      });

      const candidate1 = await User.create({
        email: 'alice@email.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Dev',
        role: 'CANDIDATE',
      });

      const candidate2 = await User.create({
        email: 'bob@email.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Coder',
        role: 'CANDIDATE',
      });

      const vacancy = await Vacancy.create({
        title: 'Backend Developer',
        description: 'Node.js expert needed',
        requirements: ['Node.js', 'MongoDB'],
        salary: { min: 90000, max: 130000, currency: 'USD' },
        location: 'New York',
        type: 'FULL_TIME',
        status: 'OPEN',
        department: 'Engineering',
        createdBy: hr._id,
      });

      await Application.create({
        vacancy: vacancy._id,
        candidate: candidate1._id,
        resume: 'https://example.com/alice.pdf',
      });

      await Application.create({
        vacancy: vacancy._id,
        candidate: candidate2._id,
        resume: 'https://example.com/bob.pdf',
      });

      const applications = await Application.findByVacancy(vacancy._id.toString());
      expect(applications.length).toBe(2);

      const applicationCount = await Application.countDocuments({
        vacancy: vacancy._id,
        isDeleted: false,
      });
      expect(applicationCount).toBe(2);
    });
  });
});
