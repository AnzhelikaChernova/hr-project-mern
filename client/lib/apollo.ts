'use client';

import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql';

const httpLink = createHttpLink({
  uri: API_URL,
});

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const wsLink = typeof window !== 'undefined'
  ? new GraphQLWsLink(
      createClient({
        url: WS_URL,
        connectionParams: () => {
          const token = localStorage.getItem('token');
          return {
            Authorization: token ? `Bearer ${token}` : '',
          };
        },
        retryAttempts: 5,
        shouldRetry: () => true,
      })
    )
  : null;

const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          vacancies: {
            keyArgs: ['filters'],
            merge(existing, incoming, { args }) {
              if (!args?.page || args.page === 1) {
                return incoming;
              }
              return {
                ...incoming,
                vacancies: [...(existing?.vacancies || []), ...incoming.vacancies],
              };
            },
          },
          applications: {
            keyArgs: ['filters'],
            merge(existing, incoming, { args }) {
              if (!args?.page || args.page === 1) {
                return incoming;
              }
              return {
                ...incoming,
                applications: [...(existing?.applications || []), ...incoming.applications],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
