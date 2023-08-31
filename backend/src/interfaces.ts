export enum RoomType {
    SINGLE = "SINGLE",
    DOUBLE = "DOUBLE",
    SUITE = "SUITE",
    DELUXE = "DELUXE"
}

export enum UserRole {
    CUSTOMER = "CUSTOMER",
    ADMIN = "ADMIN"
  }

export interface Room {
    id: number;
    type: RoomType;
    price: number;
    booked: boolean;
}
  
export interface User {
    id: number;
    email: string;
    password: string;
    fullName?: string | null;
    role: UserRole;
}
  
export interface Booking {
    id: number;
    roomId: number;
    userId: number;
    startDate: Date;
    endDate: Date;
}
  
export interface AuthPayload {
    token: string;
    user: User;
}
  
export interface Context {
    user?: User;
}
