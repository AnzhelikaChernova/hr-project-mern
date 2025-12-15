import { gql } from '@apollo/client';

export const APPLICATION_CREATED_SUBSCRIPTION = gql`
  subscription ApplicationCreated($vacancyId: ID) {
    applicationCreated(vacancyId: $vacancyId) {
      id
      status
      appliedAt
      vacancy {
        id
        title
      }
      candidate {
        id
        fullName
        email
      }
    }
  }
`;

export const APPLICATION_STATUS_UPDATED_SUBSCRIPTION = gql`
  subscription ApplicationStatusUpdated($candidateId: ID) {
    applicationStatusUpdated(candidateId: $candidateId) {
      id
      status
      vacancy {
        id
        title
        createdBy {
          company
        }
      }
    }
  }
`;

export const INTERVIEW_SCHEDULED_SUBSCRIPTION = gql`
  subscription InterviewScheduled($applicationId: ID) {
    interviewScheduled(applicationId: $applicationId) {
      id
      scheduledAt
      duration
      type
      location
      status
      application {
        id
        vacancy {
          id
          title
        }
      }
    }
  }
`;

export const NOTIFICATION_RECEIVED_SUBSCRIPTION = gql`
  subscription NotificationReceived($recipientId: ID!) {
    notificationReceived(recipientId: $recipientId) {
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
