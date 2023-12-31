import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './database';
import { Room, User, Booking, Context, AuthPayload, UserRole, RoomType } from './interfaces';
import { JWT_SECRET, SALT_ROUNDS } from './config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const resolvers = {
    Room: {
        id: (parent: Room) => parent.id,
        type: (parent: Room): RoomType => {
            if (!Object.values(RoomType).includes(parent.type)) {
                throw new Error('Invalid room type.');
            }
            return parent.type;
        },
        price: (parent: Room) => parent.price,
        booked: (parent: Room) => parent.booked,
    },

    User: {
        id: (parent: User) => parent.id,
        email: (parent: User) => parent.email,
        fullName: (parent: User) => parent.fullName,
        bookings: (parent: User) => prisma.booking.findMany({ where: { userId: parent.id } }),
        role: (parent: User): UserRole => {
            if (!Object.values(UserRole).includes(parent.role)) {
                throw new Error('Invalid user role.');
            }
            return parent.role;
        },
    },

    Booking: {
        id: (parent: Booking) => parent.id,
        roomId: (parent: Booking) => parent.roomId,
        userId: (parent: Booking) => parent.userId,
        startDate: (parent: Booking) => parent.startDate,
        endDate: (parent: Booking) => parent.endDate,
    },

    Query: {
        availableRooms: () => prisma.room.findMany({ where: { booked: false } }),
        bookings: () => prisma.booking.findMany(),
        booking: (_: any, args: { id: number }) => prisma.booking.findFirst({ where: { id: args.id } }),
        users: () => prisma.user.findMany(),
        user: (_: any, args: { id: number }) => prisma.user.findFirst({ where: { id: args.id } }),
    },

    Mutation: {
        bookRoom: async (_: any, args: { userId: number, roomId: number, startDate: Date, endDate: Date }, context: Context) => {
            if (!context.user) {
                throw new Error('UNAUTHENTICATED');
            }

            const numericUserId = Number(args.userId);
            const numericRoomId = Number(args.roomId);

            if (isNaN(numericUserId) || isNaN(numericRoomId)) {
                throw new Error('INVALID_ID_FORMAT');
            }

            const roomToBook = await prisma.room.findFirst({ where: { id: numericRoomId } });

            if (!roomToBook) {
                throw new Error('ROOM_NOT_FOUND');
            }

            const startDateISO = new Date(args.startDate).toISOString();
            const endDateISO = new Date(args.endDate).toISOString();

            const existingBooking = await prisma.booking.findFirst({
                where: {
                    roomId: roomToBook.id,
                    OR: [
                        {
                            startDate: {
                                lte: endDateISO
                            },
                            endDate: {
                                gte: startDateISO
                            }
                        },
                        {
                            startDate: {
                                gte: startDateISO
                            },
                            endDate: {
                                lte: endDateISO
                            }
                        }
                    ]
                }
            });

            if (existingBooking) {
                throw new Error('ROOM_NOT_AVAILABLE_FOR_SPECIFIED_DATES');
            }

            let newBooking;
            try {
                newBooking = await prisma.booking.create({
                    data: {
                        roomId: roomToBook.id,
                        userId: numericUserId,
                        startDate: startDateISO,
                        endDate: endDateISO,
                    }
                });

            } catch (e) {
                throw new Error('DATABASE_ERROR');
            }

            return newBooking;
        },

        register: async (_: any, args: { email: string, password: string, fullName?: string, role: UserRole }, context: Context): Promise<AuthPayload> => {

            if (args.role === UserRole.ADMIN) {
                if (!context.user) {
                    throw new Error('UNAUTHORIZED');
                }

                if (context.user.role !== UserRole.ADMIN) {
                    throw new Error('INSUFFICIENT_PERMISSIONS');
                }
            }

            if (!Object.values(UserRole).includes(args.role)) {
                throw new Error('INVALID_ROLE');
            }

            const existingUser = await prisma.user.findFirst({ where: { email: args.email } });
            if (existingUser) {
                throw new Error("EMAIL_IN_USE");
            }

            const hashedPassword = await bcrypt.hash(args.password, SALT_ROUNDS);

            const newUser = await prisma.user.create({
                data: {
                    email: args.email,
                    password: hashedPassword,
                    fullName: args.fullName,
                    role: args.role,
                }
            });

            const token = jwt.sign({ userId: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
                expiresIn: "1d"
            });

            return {
                token,
                user: {
                    ...newUser,
                    role: newUser.role as UserRole
                }
            };
        },

        login: async (_: any, args: { email: string, password: string }): Promise<AuthPayload> => {
            let user;
            try {
                user = await prisma.user.findFirst({ where: { email: args.email } });
            } catch (err) {
                if (err instanceof PrismaClientKnownRequestError) {
                    console.error('Prisma error:', err.message);

                    if (err.code === "P2021") {
                        console.error('It seems the User table is missing in the database.');
                    }
                    throw new Error("INTERNAL_SERVER_ERROR");
                }
                console.error('Unexpected error during login:', err);
                throw new Error("INTERNAL_SERVER_ERROR");
            }
            if (!user) {
                throw new Error("INVALID_CREDENTIALS");
            }
            const passwordValid = await bcrypt.compare(args.password, user.password);

            if (!passwordValid) {
                throw new Error("INVALID_CREDENTIALS");
            }

            const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
                expiresIn: "1d"
            });

            return {
                token,
                user: {
                    ...user,
                    role: user.role as UserRole
                }
            };
        },

        createRoom: async (_: any, args: { type: RoomType, price: number }, context: Context) => {
            if (!context.user) {
                throw new Error('UNAUTHENTICATED');
            }

            if (context.user.role !== UserRole.ADMIN) {
                throw new Error('INSUFFICIENT_PERMISSIONS');
            }

            try {
                const newRoom = await prisma.room.create({
                    data: {
                        type: args.type,
                        price: args.price,
                        booked: false
                    }
                });
                return newRoom;
            } catch (error) {
                throw new Error('DATABASE_ERROR');
            }
        },

        updateRoom: async (_: any, args: { id: string | number, type?: RoomType, price?: number }, context: Context) => {
            if (!context.user) {
                throw new Error('UNAUTHENTICATED');
            }

            if (context.user.role !== UserRole.ADMIN) {
                throw new Error('INSUFFICIENT_PERMISSIONS');
            }

            const roomId = typeof args.id === 'string' ? parseInt(args.id, 10) : args.id;
            if (isNaN(roomId)) {
                throw new Error('INVALID_ID');
            }

            const room = await prisma.room.findFirst({ where: { id: roomId } });

            if (!room) {
                throw new Error('ROOM_NOT_FOUND');
            }

            try {
                const updatedRoom = await prisma.room.update({
                    where: { id: roomId },
                    data: {
                        type: args.type,
                        price: args.price
                    }
                });
                return updatedRoom;
            } catch (error) {
                throw new Error('DATABASE_ERROR');
            }
        },

        deleteRoom: async (_: any, args: { id: string }, context: Context) => {
            if (!context.user) {
                throw new Error('UNAUTHENTICATED');
            }

            if (context.user.role !== UserRole.ADMIN) {
                throw new Error('INSUFFICIENT_PERMISSIONS');
            }

            const numericId = parseInt(args.id, 10);
            const room = await prisma.room.findFirst({ where: { id: numericId } });

            if (!room) {
                throw new Error('ROOM_NOT_FOUND');
            }

            try {
                const deletedRoom = await prisma.room.delete({
                    where: { id: numericId }
                });
                return deletedRoom;
            } catch (error) {
                throw new Error('DATABASE_ERROR');
            }
        },

        cancelBooking: async (_: any, args: { id: number }, context: Context) => {
            if (!context.user) {
                throw new Error('UNAUTHENTICATED');
            }

            const booking = await prisma.booking.findFirst({ where: { id: args.id } });

            if (!booking) {
                throw new Error('BOOKING_NOT_FOUND');
            }

            if (context.user.id !== booking.userId && context.user.role !== UserRole.ADMIN) {
                throw new Error('INSUFFICIENT_PERMISSIONS');
            }

            try {
                const canceledBooking = await prisma.booking.delete({
                    where: { id: args.id }
                });

                return canceledBooking;
            } catch (error) {
                throw new Error('DATABASE_ERROR');
            }
        }

    },
}
