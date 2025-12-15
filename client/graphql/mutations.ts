import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
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
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
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
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      email
      firstName
      lastName
      fullName
      phone
      avatar
      skills
      company
      position
    }
  }
`;

export const CREATE_VACANCY_MUTATION = gql`
  mutation CreateVacancy($input: CreateVacancyInput!) {
    createVacancy(input: $input) {
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
      createdAt
    }
  }
`;

export const UPDATE_VACANCY_MUTATION = gql`
  mutation UpdateVacancy($id: ID!, $input: UpdateVacancyInput!) {
    updateVacancy(id: $id, input: $input) {
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
    }
  }
`;

export const DELETE_VACANCY_MUTATION = gql`
  mutation DeleteVacancy($id: ID!) {
    deleteVacancy(id: $id) {
      id
    }
  }
`;

export const APPLY_TO_VACANCY_MUTATION = gql`
  mutation ApplyToVacancy($input: ApplyToVacancyInput!) {
    applyToVacancy(input: $input) {
      id
      status
      appliedAt
      vacancy {
        id
        title
      }
    }
  }
`;

export const UPDATE_APPLICATION_MUTATION = gql`
  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
    updateApplication(id: $id, input: $input) {
      id
      status
      notes
    }
  }
`;

export const WITHDRAW_APPLICATION_MUTATION = gql`
  mutation WithdrawApplication($id: ID!) {
    withdrawApplication(id: $id) {
      id
    }
  }
`;

export const SCHEDULE_INTERVIEW_MUTATION = gql`
  mutation ScheduleInterview($input: ScheduleInterviewInput!) {
    scheduleInterview(input: $input) {
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
`;

export const UPDATE_INTERVIEW_MUTATION = gql`
  mutation UpdateInterview($id: ID!, $input: UpdateInterviewInput!) {
    updateInterview(id: $id, input: $input) {
      id
      scheduledAt
      duration
      type
      location
      status
    }
  }
`;

export const CANCEL_INTERVIEW_MUTATION = gql`
  mutation CancelInterview($id: ID!) {
    cancelInterview(id: $id) {
      id
      status
    }
  }
`;

export const SUBMIT_FEEDBACK_MUTATION = gql`
  mutation SubmitFeedback($input: SubmitFeedbackInput!) {
    submitFeedback(input: $input) {
      id
      rating
      technicalSkills
      communication
      cultureFit
      comments
      recommendation
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      read
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const DELETE_NOTIFICATION_MUTATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      id
    }
  }
`;
