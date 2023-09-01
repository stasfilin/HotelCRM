import {
    ApolloClient,
    InMemoryCache,
} from "@apollo/client";

export const client = new ApolloClient({
    uri: "http://localhost:9090/graphql",
    cache: new InMemoryCache(),
});
