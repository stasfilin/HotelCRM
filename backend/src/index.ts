import { ApolloServer, AuthenticationError } from 'apollo-server';
import jwt from 'jsonwebtoken';
import { resolvers } from './resolvers';
import {typeDefs} from './graphql/schema'
import {JWT_SECRET, PORT} from './config'

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers.authorization || '';

        try {
            if (token) {
                const user = jwt.verify(token, JWT_SECRET) as any; 
                return { user };
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error('Failed to verify token:', err.message);
                throw new AuthenticationError('You must be logged in');
            }
            throw err;
        }

        return {};
    },
    debug: false
});

server.listen({ PORT })
    .then(({ url }) => {
        console.log(`Server runs at: ${url}`);
    })
    .catch((error: Error) => {
        console.error('Failed to start the server:', error.message);
    });
