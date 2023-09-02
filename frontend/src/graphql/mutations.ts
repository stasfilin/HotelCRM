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

export const CREATE_ROOM_MUTATION = gql`
  mutation CreateRoom($type: RoomType!, $price: Float!) {
    createRoom(type: $type, price: $price) {
      id
      type
      price
      booked
    }
  }
`;

export const UPDATE_ROOM_MUTATION = gql`
  mutation UpdateRoom($id: ID!, $type: RoomType, $price: Float) {
    updateRoom(id: $id, type: $type, price: $price) {
      id
      type
      price
      booked
    }
  }
`;

export const DELETE_ROOM_MUTATION = gql`
mutation DeleteRoom($id: ID!) {
  deleteRoom(id: $id) {
    id
  }
}
`;
