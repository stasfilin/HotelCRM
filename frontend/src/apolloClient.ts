import {
    ApolloClient,
    InMemoryCache,
    createHttpLink
} from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { getToken } from "./utils/auth";

const httpLink = createHttpLink({
    uri: 'http://localhost:9090/graphql',
});

const authLink = setContext((_, { headers }) => {
    const token = getToken();
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    };
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});
