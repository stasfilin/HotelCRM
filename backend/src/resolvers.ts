import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {Room, User, Booking, Context, AuthPayload, } from './interfaces';

import { rooms, users, bookings } from './database';
import { JWT_SECRET } from './config';

const SALT_ROUNDS = 10;

export const resolvers = {
    Room: {
        id: (parent: Room): string => parent.id,
        type: (parent: Room): string => parent.type,
        price: (parent: Room): number => parent.price,
        booked: (parent: Room): boolean => parent.booked,
    },

    User: {
        id: (parent: User): string => parent.id,
        email: (parent: User): string => parent.email,
        fullName: (parent: User): string | undefined => parent.fullName,
        bookings: (parent: User): Booking[] => bookings.filter((booking: Booking) => booking.userId === parent.id),
        role: (parent: User): string => parent.role,
    },

    Booking: {
        id: (parent: Booking): string => parent.id,
        roomId: (parent: Booking): string => parent.roomId,
        userId: (parent: Booking): string => parent.userId,
        startDate: (parent: Booking): string => parent.startDate,
        endDate: (parent: Booking): string => parent.endDate,
    },

    Query: {
        availableRooms: (): Room[] => rooms.filter((room: Room) => !room.booked),
        bookings: (): Booking[] => bookings,
        booking: (parent: unknown, args: { id: string }): Booking | undefined => bookings.find((booking: Booking) => booking.id === args.id),
        users: (): User[] => users,
        user: (parent: unknown, args: { id: string }): User | undefined => users.find((user: User) => user.id === args.id),
        userBookings: (parent: unknown, args: { userId: string }): Booking[] => bookings.filter((booking: Booking) => booking.userId === args.userId),
    },

    Mutation: {
        bookRoom: (parent: unknown, args: { userId: string, roomId: string, startDate: string, endDate: string }, context: Context): Booking => {
            if (!context.user) {
                throw new Error('You must be logged in to book a room');
            }

            const newBooking: Booking = {
                id: `${bookings.length + 1}`,
                roomId: args.roomId,
                userId: context.user.id,
                startDate: args.startDate,
                endDate: args.endDate,
            };
            bookings.push(newBooking);

            const roomToBook = rooms.find((room: Room) => room.id === args.roomId);
            if (roomToBook) {
                roomToBook.booked = true;
            }

            return newBooking;
        },        

        register: async (parent: unknown, args: { email: string, password: string, fullName?: string, role: string }): Promise<AuthPayload> => {
            const hashedPassword = await bcrypt.hash(args.password, SALT_ROUNDS);
            const newUser: User = {
                id: `${users.length + 1}`,
                email: args.email,
                password: hashedPassword,
                fullName: args.fullName,
                role: args.role,
            };
            users.push(newUser);

            const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, {
                expiresIn: "1d"
            });
            return {
                token,
                user: newUser,
            };
        },
        
        login: async (parent: unknown, args: { email: string, password: string }): Promise<AuthPayload> => {
            const user = users.find((u: User) => u.email === args.email);
            if (!user) {
                throw new Error("Invalid email or password.");
            }

            const passwordValid = await bcrypt.compare(args.password, user.password);
            if (!passwordValid) {
                throw new Error("Invalid email or password.");
            }

            const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
                expiresIn: "1d"
            });

            return {
                token,
                user,
            };
        },        
    },
}
