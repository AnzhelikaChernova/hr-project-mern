import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Vacancy, Application, Interview, Feedback, Notification } from './models';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hr-platform';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Vacancy.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Feedback.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const hrUser = await User.create({
      email: 'hr@company.com',
      password: 'password123',
      firstName: 'Anna',
      lastName: 'Smith',
      role: 'HR',
      phone: '+1-555-0100',
      company: 'TechCorp Inc.',
      position: 'Senior HR Manager',
    });
    console.log('Created HR user:', hrUser.email);

    const hrUser2 = await User.create({
      email: 'recruiter@company.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Davis',
      role: 'HR',
      phone: '+1-555-0101',
      company: 'TechCorp Inc.',
      position: 'Technical Recruiter',
    });
    console.log('Created HR user:', hrUser2.email);

    const candidate1 = await User.create({
      email: 'candidate@email.com',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Johnson',
      role: 'CANDIDATE',
      phone: '+1-555-0200',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'GraphQL'],
      position: 'Senior Frontend Developer',
    });
    console.log('Created candidate:', candidate1.email);

    const candidate2 = await User.create({
      email: 'jane.doe@email.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'CANDIDATE',
      phone: '+1-555-0201',
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
      position: 'Backend Developer',
    });
    console.log('Created candidate:', candidate2.email);

    const candidate3 = await User.create({
      email: 'mike.wilson@email.com',
      password: 'password123',
      firstName: 'Mike',
      lastName: 'Wilson',
      role: 'CANDIDATE',
      phone: '+1-555-0202',
      skills: ['Java', 'Spring Boot', 'Kubernetes', 'Microservices'],
      position: 'Java Developer',
    });
    console.log('Created candidate:', candidate3.email);

    const vacancy1 = await Vacancy.create({
      title: 'Senior Frontend Developer',
      description: `We are looking for an experienced Senior Frontend Developer to join our dynamic team.

You will be responsible for building and maintaining high-performance web applications using modern technologies. This role offers the opportunity to work on cutting-edge projects and collaborate with talented engineers.

**Responsibilities:**
- Develop and maintain responsive web applications
- Collaborate with designers and backend developers
- Write clean, maintainable, and well-documented code
- Participate in code reviews and technical discussions
- Mentor junior developers

**What we offer:**
- Competitive salary and benefits
- Remote-first culture
- Professional development opportunities
- Modern tech stack`,
      requirements: [
        '5+ years of experience with React',
        'Strong TypeScript skills',
        'Experience with state management (Redux, Zustand)',
        'Knowledge of testing frameworks (Jest, React Testing Library)',
        'Experience with GraphQL',
        'Excellent communication skills',
      ],
      salary: { min: 120000, max: 160000, currency: 'USD' },
      location: 'Remote / San Francisco, CA',
      type: 'FULL_TIME',
      status: 'OPEN',
      createdBy: hrUser._id,
      department: 'Engineering',
    });
    console.log('Created vacancy:', vacancy1.title);

    const vacancy2 = await Vacancy.create({
      title: 'Backend Engineer (Node.js)',
      description: `Join our backend team to build scalable APIs and microservices.

We're building the next generation of our platform and need talented engineers who are passionate about creating robust, scalable systems.

**What you'll do:**
- Design and implement RESTful and GraphQL APIs
- Build microservices architecture
- Optimize database performance
- Implement security best practices
- Write comprehensive tests`,
      requirements: [
        '3+ years of Node.js experience',
        'Experience with Express.js or Fastify',
        'Strong knowledge of MongoDB and PostgreSQL',
        'Understanding of microservices architecture',
        'Experience with Docker and Kubernetes',
      ],
      salary: { min: 100000, max: 140000, currency: 'USD' },
      location: 'New York, NY',
      type: 'FULL_TIME',
      status: 'OPEN',
      createdBy: hrUser._id,
      department: 'Engineering',
    });
    console.log('Created vacancy:', vacancy2.title);

    const vacancy3 = await Vacancy.create({
      title: 'DevOps Engineer',
      description: `We need a skilled DevOps Engineer to improve our CI/CD pipelines and cloud infrastructure.

You will work closely with development teams to streamline deployment processes and ensure system reliability.`,
      requirements: [
        'Experience with AWS or GCP',
        'Strong knowledge of Docker and Kubernetes',
        'CI/CD pipeline experience (GitHub Actions, Jenkins)',
        'Infrastructure as Code (Terraform, CloudFormation)',
        'Monitoring and logging (Prometheus, Grafana, ELK)',
      ],
      salary: { min: 130000, max: 170000, currency: 'USD' },
      location: 'Remote',
      type: 'REMOTE',
      status: 'OPEN',
      createdBy: hrUser2._id,
      department: 'Infrastructure',
    });
    console.log('Created vacancy:', vacancy3.title);

    const vacancy4 = await Vacancy.create({
      title: 'Part-time UI/UX Designer',
      description: `Looking for a talented UI/UX Designer to work on our product design.

This is a part-time position perfect for designers who want flexibility while working on exciting projects.`,
      requirements: [
        'Portfolio demonstrating UI/UX work',
        'Proficiency in Figma',
        'Understanding of design systems',
        'Experience with user research',
        'Basic knowledge of HTML/CSS',
      ],
      salary: { min: 50, max: 80, currency: 'USD' },
      location: 'Remote',
      type: 'PART_TIME',
      status: 'OPEN',
      createdBy: hrUser._id,
      department: 'Design',
    });
    console.log('Created vacancy:', vacancy4.title);

    const application1 = await Application.create({
      vacancy: vacancy1._id,
      candidate: candidate1._id,
      status: 'INTERVIEW',
      coverLetter: `Dear Hiring Manager,

I am excited to apply for the Senior Frontend Developer position. With over 6 years of experience in React and TypeScript, I believe I would be a great fit for your team.

My experience includes building complex SPAs, implementing state management solutions, and working with GraphQL APIs. I am passionate about writing clean, maintainable code and mentoring junior developers.

I look forward to the opportunity to contribute to your team.

Best regards,
Alex Johnson`,
      resume: 'https://example.com/resumes/alex-johnson.pdf',
    });
    console.log('Created application for:', candidate1.email);

    const application2 = await Application.create({
      vacancy: vacancy2._id,
      candidate: candidate2._id,
      status: 'REVIEWING',
      coverLetter: `Hello,

I am writing to express my interest in the Backend Engineer position. I have extensive experience with Python and Django, and I am eager to expand my skills with Node.js.

I have worked on large-scale applications handling millions of requests daily. My experience with AWS and Docker will allow me to contribute immediately to your infrastructure.

Thank you for considering my application.

Jane Doe`,
      resume: 'https://example.com/resumes/jane-doe.pdf',
    });
    console.log('Created application for:', candidate2.email);

    const application3 = await Application.create({
      vacancy: vacancy3._id,
      candidate: candidate3._id,
      status: 'PENDING',
      coverLetter: `Dear Team,

I am applying for the DevOps Engineer role. With my background in Java development and infrastructure management, I understand both sides of the development process.

I have experience setting up CI/CD pipelines and managing Kubernetes clusters at scale.

Looking forward to hearing from you.

Mike Wilson`,
      resume: 'https://example.com/resumes/mike-wilson.pdf',
    });
    console.log('Created application for:', candidate3.email);

    const interview1 = await Interview.create({
      application: application1._id,
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration: 60,
      type: 'VIDEO',
      location: 'https://meet.google.com/abc-defg-hij',
      status: 'SCHEDULED',
      interviewers: [hrUser._id, hrUser2._id],
      notes: 'Technical interview focusing on React and system design',
    });
    console.log('Created interview for application:', application1._id);

    const pastInterview = await Interview.create({
      application: application1._id,
      scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      duration: 30,
      type: 'PHONE',
      location: '+1-555-0100',
      status: 'COMPLETED',
      interviewers: [hrUser._id],
      notes: 'Initial phone screening',
    });
    console.log('Created past interview');

    await Feedback.create({
      interview: pastInterview._id,
      author: hrUser._id,
      rating: 4,
      technicalSkills: 5,
      communication: 4,
      cultureFit: 4,
      comments: `Alex demonstrated excellent technical skills during the phone screening.
Strong knowledge of React ecosystem and good communication.
Recommended for technical interview.`,
      recommendation: 'HIRE',
    });
    console.log('Created feedback');

    // Create test notifications for HR
    await Notification.create({
      recipient: hrUser._id,
      type: 'APPLICATION_RECEIVED',
      title: 'New Application',
      message: `${candidate1.firstName} ${candidate1.lastName} applied for ${vacancy1.title}`,
      read: false,
      relatedApplication: application1._id,
      relatedVacancy: vacancy1._id,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    });

    await Notification.create({
      recipient: hrUser._id,
      type: 'APPLICATION_RECEIVED',
      title: 'New Application',
      message: `${candidate2.firstName} ${candidate2.lastName} applied for ${vacancy2.title}`,
      read: false,
      relatedApplication: application2._id,
      relatedVacancy: vacancy2._id,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    });

    await Notification.create({
      recipient: hrUser2._id,
      type: 'APPLICATION_RECEIVED',
      title: 'New Application',
      message: `${candidate3.firstName} ${candidate3.lastName} applied for ${vacancy3.title}`,
      read: true,
      relatedApplication: application3._id,
      relatedVacancy: vacancy3._id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    });

    // Create test notifications for Candidates
    await Notification.create({
      recipient: candidate1._id,
      type: 'APPLICATION_STATUS_UPDATED',
      title: 'Application Status Updated',
      message: `Your application for ${vacancy1.title} is now "Interview Stage"`,
      read: false,
      relatedApplication: application1._id,
      relatedVacancy: vacancy1._id,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    });

    await Notification.create({
      recipient: candidate1._id,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled',
      message: `Interview for ${vacancy1.title} scheduled for ${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      read: false,
      relatedApplication: application1._id,
      relatedVacancy: vacancy1._id,
      relatedInterview: interview1._id,
      createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    });

    await Notification.create({
      recipient: candidate2._id,
      type: 'APPLICATION_STATUS_UPDATED',
      title: 'Application Status Updated',
      message: `Your application for ${vacancy2.title} is now "Under Review"`,
      read: true,
      relatedApplication: application2._id,
      relatedVacancy: vacancy2._id,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    });

    console.log('Created test notifications');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('HR User: hr@company.com / password123');
    console.log('HR User 2: recruiter@company.com / password123');
    console.log('Candidate: candidate@email.com / password123');
    console.log('Candidate 2: jane.doe@email.com / password123');
    console.log('Candidate 3: mike.wilson@email.com / password123');

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
