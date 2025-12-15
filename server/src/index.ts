import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import connectDB from './config/db';
import typeDefs from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';
import { GraphQLContext, SubscriptionContext } from './types/context';
import { extractTokenFromHeader, getUserFromToken, verifyToken } from './middleware/auth';
import { createLoaders } from './utils/dataLoaders';
import { formatError } from './utils/errors';

const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx): Promise<SubscriptionContext> => {
        const token = ctx.connectionParams?.Authorization as string | undefined;
        const cleanToken = token?.replace('Bearer ', '');

        if (cleanToken) {
          try {
            const decoded = verifyToken(cleanToken);
            return {
              user: {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
              },
            };
          } catch {
            return { user: null };
          }
        }
        return { user: null };
      },
    },
    wsServer
  );

  const server = new ApolloServer<GraphQLContext>({
    schema,
    formatError,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    cors({
      origin: CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));

  app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<GraphQLContext> => {
        const token = extractTokenFromHeader(req);
        const user = await getUserFromToken(token);

        return {
          req,
          res,
          user,
          loaders: createLoaders(),
        };
      },
    })
  );

  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🔌 WebSocket ready at ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
