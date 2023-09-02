import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            user {
                id
                email
                role
            }
        }
    }
`;

export const REGISTER_MUTATION = gql`
    mutation Register($email: String!, $password: String!, $fullName: String, $role: UserRole!) {
        register(email: $email, password: $password, fullName: $fullName, role: $role) {
            token
            user {
                id
                email
                role
            }
        }
    }
`;
