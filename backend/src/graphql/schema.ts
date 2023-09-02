import { gql } from 'apollo-server';

export const typeDefs = gql`
  enum RoomType {
    SINGLE
    DOUBLE
    SUITE
    DELUXE
  }

  type Room {
    id: ID!
    type: RoomType!
    price: Float!
    booked: Boolean!
  }

  type User {
    id: ID!
    email: String!
    password: String!
    fullName: String
    bookings: [Booking!] 
    role: UserRole!
  }

  type Booking {
    id: ID!
    roomId: ID!
    userId: ID!
    startDate: String!
    endDate: String!
  }

  enum UserRole {
    CUSTOMER
    ADMIN
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    availableRooms: [Room!]!
    bookings: [Booking!]!
    booking(id: ID!): Booking
    users: [User!]!
    user(id: ID!): User
    login(email: String!, password: String!): AuthPayload!
    userBookings(userId: ID!): [Booking!]!
  }

  type Mutation {
    bookRoom(userId: ID!, roomId: ID!, startDate: String!, endDate: String!): Booking!
    register(email: String!, password: String!, fullName: String, role: UserRole!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    createRoom(type: RoomType!, price: Float!): Room!
    updateRoom(id: ID!, type: RoomType, price: Float): Room!
    deleteRoom(id: ID!): Room!

    cancelBooking(id: ID!): Booking!
  }
`;
