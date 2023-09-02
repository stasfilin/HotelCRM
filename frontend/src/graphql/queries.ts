import { gql } from "graphql-tag";

export const AVAILABLE_ROOMS_QUERY = gql`
  query AvailableRooms {
    availableRooms {
      id
      type
      price
      booked
    }
  }
`;
