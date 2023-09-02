import { ApolloServer, AuthenticationError } from 'apollo-server';
import jwt from 'jsonwebtoken';
import { resolvers } from './resolvers';
import { typeDefs } from './graphql/schema'
import { JWT_SECRET, port } from './config'

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!token) {
            return {};
        }

        try {
            const user = jwt.verify(token, JWT_SECRET) as any;
            return { user };
        } catch (err) {
            if (err instanceof Error) {
                console.error('Failed to verify token:', err.message);
                throw new AuthenticationError('Your session is not valid. Please log in again.');
            }
            throw err;
        }
    },
    // formatError: (err) => {
    //     console.error('GraphQL Error:', err);
    //     return err;
    // },
    // formatResponse: (response, requestContext) => {
    //     console.log('GraphQL Request:', requestContext.request.query);
    //     console.log('Variables:', requestContext.request.variables);
    //     console.log('GraphQL Response:', response);
    //     return response;
    // },
    debug: true
});

server.listen({ port })
    .then(({ url }) => {
        console.log(`Server runs at: ${url}`);
    })
    .catch((error: Error) => {
        console.error('Failed to start the server:', error.message);
    });
