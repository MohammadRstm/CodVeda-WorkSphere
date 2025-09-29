import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { getUserFromToken } from "./middlewares/auth.js";

// Apollo Server v4
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

// Import socket initialization
import { init } from './socket.js';

// Import GraphQL schema + resolvers
import typeDefs from './graphql/schema.js';
import resolvers from './graphql/resolvers/index.js';

// Needed to resolve __dirname in ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Initialize socket.io
  const io = init(server);

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  const reactBuildPath = path.join(__dirname, '../dist');
  app.use(express.static(reactBuildPath));

  app.get('*', (req, res) => {
    // skip /graphql and /uploads routes
    if (req.path.startsWith('/graphql') || req.path.startsWith('/uploads')) {
      return;
    }
    res.sendFile(path.join(reactBuildPath, 'index.html'));
  });

  // Apollo Server setup
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer: server })],
  });

  await apolloServer.start();

  app.use(
  '/graphql',
  bodyParser.json(),
  expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      const user = getUserFromToken(token); // decode JWT (id, username, role)

      return { user, io }; // also pass io if you need it in resolvers
    },
  })
);


  // Connect MongoDB
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/codVedaLevel_3';
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB!');

    server.listen(3000,"0.0.0.0",  () => {
      console.log('🚀 Server running on http://localhost:3000');
      console.log('⚡ GraphQL endpoint ready at http://localhost:3000/graphql');
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
  }
}

startServer();
