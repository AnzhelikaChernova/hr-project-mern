const typeDefs = `#graphql
  # Enums
  enum UserRole {
    HR
    CANDIDATE
  }

  enum VacancyType {
    FULL_TIME
    PART_TIME
    CONTRACT
    REMOTE
  }

  enum VacancyStatus {
    OPEN
    CLOSED
    DRAFT
  }

  enum ApplicationStatus {
    PENDING
    REVIEWING
    INTERVIEW
    OFFERED
    REJECTED
    ACCEPTED
  }

  enum InterviewType {
    PHONE
    VIDEO
    ONSITE
  }

  enum InterviewStatus {
    SCHEDULED
    COMPLETED
    CANCELLED
  }

  enum Recommendation {
    HIRE
    NO_HIRE
    MAYBE
  }

  enum NotificationType {
    APPLICATION_RECEIVED
    APPLICATION_STATUS_UPDATED
    INTERVIEW_SCHEDULED
    INTERVIEW_REMINDER
    FEEDBACK_RECEIVED
  }

  # Types
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    fullName: String!
    role: UserRole!
    phone: String
    avatar: String
    skills: [String!]
    company: String
    position: String
    createdAt: String!
    updatedAt: String!
  }

  type Salary {
    min: Float!
    max: Float!
    currency: String!
  }

  type Vacancy {
    id: ID!
    title: String!
    description: String!
    requirements: [String!]!
    salary: Salary!
    location: String!
    type: VacancyType!
    status: VacancyStatus!
    createdBy: User!
    department: String!
    applicationCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Application {
    id: ID!
    vacancy: Vacancy!
    candidate: User!
    status: ApplicationStatus!
    coverLetter: String
    resume: String!
    appliedAt: String!
    notes: String
    interviews: [Interview!]!
    createdAt: String!
    updatedAt: String!
  }

  type Interview {
    id: ID!
    application: Application!
    scheduledAt: String!
    duration: Int!
    type: InterviewType!
    location: String!
    status: InterviewStatus!
    interviewers: [User!]!
    notes: String
    feedbacks: [Feedback!]!
    createdAt: String!
    updatedAt: String!
  }

  type Feedback {
    id: ID!
    interview: Interview!
    author: User!
    rating: Int!
    technicalSkills: Int!
    communication: Int!
    cultureFit: Int!
    comments: String!
    recommendation: Recommendation!
    createdAt: String!
    updatedAt: String!
  }

  type Notification {
    id: ID!
    recipient: User!
    type: NotificationType!
    title: String!
    message: String!
    read: Boolean!
    relatedApplication: Application
    relatedVacancy: Vacancy
    relatedInterview: Interview
    createdAt: String!
    updatedAt: String!
  }

  type NotificationCount {
    total: Int!
    unread: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PaginatedVacancies {
    vacancies: [Vacancy!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type PaginatedApplications {
    applications: [Application!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  type DashboardStats {
    totalVacancies: Int!
    openVacancies: Int!
    totalApplications: Int!
    pendingApplications: Int!
    scheduledInterviews: Int!
  }

  # Inputs
  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    phone: String
    skills: [String!]
    company: String
    position: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    phone: String
    avatar: String
    skills: [String!]
    company: String
    position: String
  }

  input SalaryInput {
    min: Float!
    max: Float!
    currency: String!
  }

  input CreateVacancyInput {
    title: String!
    description: String!
    requirements: [String!]!
    salary: SalaryInput!
    location: String!
    type: VacancyType!
    department: String!
    status: VacancyStatus
  }

  input UpdateVacancyInput {
    title: String
    description: String
    requirements: [String!]
    salary: SalaryInput
    location: String
    type: VacancyType
    status: VacancyStatus
    department: String
  }

  input ApplyToVacancyInput {
    vacancyId: ID!
    coverLetter: String
    resume: String!
  }

  input UpdateApplicationInput {
    status: ApplicationStatus
    notes: String
  }

  input ScheduleInterviewInput {
    applicationId: ID!
    scheduledAt: String!
    duration: Int!
    type: InterviewType!
    location: String!
    interviewerIds: [ID!]!
    notes: String
  }

  input UpdateInterviewInput {
    scheduledAt: String
    duration: Int
    type: InterviewType
    location: String
    status: InterviewStatus
    interviewerIds: [ID!]
    notes: String
  }

  input SubmitFeedbackInput {
    interviewId: ID!
    rating: Int!
    technicalSkills: Int!
    communication: Int!
    cultureFit: Int!
    comments: String!
    recommendation: Recommendation!
  }

  input VacancyFilters {
    status: VacancyStatus
    type: VacancyType
    search: String
    department: String
  }

  input ApplicationFilters {
    vacancyId: ID
    candidateId: ID
    status: ApplicationStatus
  }

  # Queries
  type Query {
    # Auth
    me: User

    # Users
    users(role: UserRole, search: String, limit: Int, offset: Int): [User!]!
    user(id: ID!): User

    # Vacancies
    vacancies(filters: VacancyFilters, page: Int, limit: Int): PaginatedVacancies!
    vacancy(id: ID!): Vacancy
    myVacancies(page: Int, limit: Int): PaginatedVacancies!

    # Applications
    applications(filters: ApplicationFilters, page: Int, limit: Int): PaginatedApplications!
    application(id: ID!): Application
    myApplications(page: Int, limit: Int): PaginatedApplications!

    # Interviews
    interviews(applicationId: ID): [Interview!]!
    interview(id: ID!): Interview
    myInterviews: [Interview!]!

    # Feedback
    feedbacks(interviewId: ID!): [Feedback!]!
    feedback(id: ID!): Feedback

    # Dashboard
    dashboardStats: DashboardStats!

    # Notifications
    notifications(limit: Int, offset: Int, unreadOnly: Boolean): [Notification!]!
    notificationCount: NotificationCount!
  }

  # Mutations
  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Users
    updateUser(input: UpdateUserInput!): User!
    deleteUser: User!

    # Vacancies
    createVacancy(input: CreateVacancyInput!): Vacancy!
    updateVacancy(id: ID!, input: UpdateVacancyInput!): Vacancy!
    deleteVacancy(id: ID!): Vacancy!

    # Applications
    applyToVacancy(input: ApplyToVacancyInput!): Application!
    updateApplication(id: ID!, input: UpdateApplicationInput!): Application!
    withdrawApplication(id: ID!): Application!

    # Interviews
    scheduleInterview(input: ScheduleInterviewInput!): Interview!
    updateInterview(id: ID!, input: UpdateInterviewInput!): Interview!
    cancelInterview(id: ID!): Interview!

    # Feedback
    submitFeedback(input: SubmitFeedbackInput!): Feedback!
    updateFeedback(id: ID!, input: SubmitFeedbackInput!): Feedback!
    deleteFeedback(id: ID!): Feedback!

    # Notifications
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Int!
    deleteNotification(id: ID!): Notification!
  }

  # Subscriptions
  type Subscription {
    applicationCreated(vacancyId: ID): Application!
    applicationStatusUpdated(candidateId: ID): Application!
    interviewScheduled(applicationId: ID): Interview!
    notificationReceived(recipientId: ID!): Notification!
  }
`;

export default typeDefs;
