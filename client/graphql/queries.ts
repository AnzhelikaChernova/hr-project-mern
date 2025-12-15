import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      fullName
      role
      phone
      avatar
      skills
      company
      position
    }
  }
`;

export const USERS_QUERY = gql`
  query Users($role: UserRole, $search: String, $limit: Int, $offset: Int) {
    users(role: $role, search: $search, limit: $limit, offset: $offset) {
      id
      email
      firstName
      lastName
      fullName
      role
      phone
      skills
      company
      position
    }
  }
`;

export const VACANCIES_QUERY = gql`
  query Vacancies($filters: VacancyFilters, $page: Int, $limit: Int) {
    vacancies(filters: $filters, page: $page, limit: $limit) {
      vacancies {
        id
        title
        description
        requirements
        salary {
          min
          max
          currency
        }
        location
        type
        status
        department
        applicationCount
        createdAt
        createdBy {
          id
          fullName
          company
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const VACANCY_QUERY = gql`
  query Vacancy($id: ID!) {
    vacancy(id: $id) {
      id
      title
      description
      requirements
      salary {
        min
        max
        currency
      }
      location
      type
      status
      department
      applicationCount
      createdAt
      updatedAt
      createdBy {
        id
        fullName
        email
        company
      }
    }
  }
`;

export const MY_VACANCIES_QUERY = gql`
  query MyVacancies($page: Int, $limit: Int) {
    myVacancies(page: $page, limit: $limit) {
      vacancies {
        id
        title
        status
        type
        location
        applicationCount
        createdAt
      }
      total
      page
      totalPages
    }
  }
`;

export const APPLICATIONS_QUERY = gql`
  query Applications($filters: ApplicationFilters, $page: Int, $limit: Int) {
    applications(filters: $filters, page: $page, limit: $limit) {
      applications {
        id
        status
        coverLetter
        resume
        appliedAt
        notes
        vacancy {
          id
          title
          company: createdBy {
            company
          }
        }
        candidate {
          id
          fullName
          email
          phone
          skills
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const APPLICATION_QUERY = gql`
  query Application($id: ID!) {
    application(id: $id) {
      id
      status
      coverLetter
      resume
      appliedAt
      notes
      vacancy {
        id
        title
        description
        requirements
        salary {
          min
          max
          currency
        }
        location
        type
        createdBy {
          id
          fullName
          company
        }
      }
      candidate {
        id
        fullName
        email
        phone
        skills
        position
      }
      interviews {
        id
        scheduledAt
        duration
        type
        location
        status
        interviewers {
          id
          fullName
        }
      }
    }
  }
`;

export const MY_APPLICATIONS_QUERY = gql`
  query MyApplications($page: Int, $limit: Int) {
    myApplications(page: $page, limit: $limit) {
      applications {
        id
        status
        appliedAt
        vacancy {
          id
          title
          location
          type
          createdBy {
            company
          }
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const INTERVIEWS_QUERY = gql`
  query Interviews($applicationId: ID) {
    interviews(applicationId: $applicationId) {
      id
      scheduledAt
      duration
      type
      location
      status
      notes
      application {
        id
        candidate {
          id
          fullName
        }
        vacancy {
          id
          title
        }
      }
      interviewers {
        id
        fullName
      }
    }
  }
`;

export const MY_INTERVIEWS_QUERY = gql`
  query MyInterviews {
    myInterviews {
      id
      scheduledAt
      duration
      type
      location
      status
      application {
        id
        candidate {
          id
          fullName
        }
        vacancy {
          id
          title
        }
      }
      interviewers {
        id
        fullName
      }
    }
  }
`;

export const FEEDBACKS_QUERY = gql`
  query Feedbacks($interviewId: ID!) {
    feedbacks(interviewId: $interviewId) {
      id
      rating
      technicalSkills
      communication
      cultureFit
      comments
      recommendation
      createdAt
      author {
        id
        fullName
      }
    }
  }
`;

export const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      totalVacancies
      openVacancies
      totalApplications
      pendingApplications
      scheduledInterviews
    }
  }
`;

export const NOTIFICATIONS_QUERY = gql`
  query Notifications($limit: Int, $offset: Int, $unreadOnly: Boolean) {
    notifications(limit: $limit, offset: $offset, unreadOnly: $unreadOnly) {
      id
      type
      title
      message
      read
      createdAt
      relatedApplication {
        id
      }
      relatedVacancy {
        id
        title
      }
      relatedInterview {
        id
      }
    }
  }
`;

export const NOTIFICATION_COUNT_QUERY = gql`
  query NotificationCount {
    notificationCount {
      total
      unread
    }
  }
`;
