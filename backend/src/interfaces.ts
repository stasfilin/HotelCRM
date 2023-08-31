export interface Room {
    id: string;
    type: string;
    price: number;
    booked: boolean;
}
  
export interface User {
    id: string;
    email: string;
    password: string;
    fullName?: string;
    role: string;
}
  
export interface Booking {
    id: string;
    roomId: string;
    userId: string;
    startDate: string;
    endDate: string;
}
  
export interface AuthPayload {
    token: string;
    user: User;
}
  
export interface Context {
    user?: User;
}