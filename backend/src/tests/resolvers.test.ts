import { prismaMock } from '../prismaMock';

jest.mock('../database', () => ({
  prisma: prismaMock,
}));

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, SALT_ROUNDS } from '../config';
import { prisma } from "../database";
import { Booking, Room, RoomType, User, UserRole } from '../interfaces';
import { resolvers } from "../resolvers";

describe('Resolvers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Room Resolvers', () => {

    it('should resolve the room type', () => {
      const room: Room = {
        id: 1,
        type: RoomType.DELUXE,
        price: 100,
        booked: false,
      };

      const result = resolvers.Room.type(room);

      expect(result).toEqual('DELUXE');
    });

    it('should return all rooms', async () => {
      const rooms: Room[] = [
        { id: 1, type: RoomType.DELUXE, price: 100, booked: false },
        { id: 2, type: RoomType.SINGLE, price: 50, booked: true },
      ];

      (prisma.room.findMany as jest.Mock).mockResolvedValue(rooms);

      const result = await resolvers.Query.availableRooms();

      expect(result).toEqual(rooms);
    });
  });


  describe('User Resolvers', () => {
    it('should return all bookings for a user', async () => {
      const user: User = {
        id: 1,
        email: 'test@email.com',
        password: 'testPassword',
        fullName: 'John Doe',
        role: UserRole.CUSTOMER
      };

      const bookings: Booking[] = [{
        id: 1,
        roomId: 2,
        userId: 1,
        startDate: new Date(),
        endDate: new Date()
      }];

      (prisma.booking.findMany as jest.Mock).mockResolvedValue(bookings);

      const result = await resolvers.User.bookings(user);

      expect(result).toEqual(bookings);
    });
  });


  describe('Booking Resolvers', () => {

    const booking: Booking = {
      id: 1,
      roomId: 2,
      userId: 1,
      startDate: new Date('2023-09-01T10:20:30Z'),
      endDate: new Date('2023-09-05T10:20:30Z')
    };

    it('should return the booking id', () => {
      const result = resolvers.Booking.id(booking);
      expect(result).toEqual(booking.id);
    });

    it('should return the booking roomId', () => {
      const result = resolvers.Booking.roomId(booking);
      expect(result).toEqual(booking.roomId);
    });

    it('should return the booking userId', () => {
      const result = resolvers.Booking.userId(booking);
      expect(result).toEqual(booking.userId);
    });

    it('should return the booking startDate', () => {
      const result = resolvers.Booking.startDate(booking);
      expect(result).toEqual(booking.startDate);
    });

    it('should return the booking endDate', () => {
      const result = resolvers.Booking.endDate(booking);
      expect(result).toEqual(booking.endDate);
    });

  });

  describe('Query Resolvers', () => {

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return all available rooms', async () => {
      const rooms: Room[] = [
        { id: 1, type: RoomType.DELUXE, price: 100, booked: false },
        { id: 2, type: RoomType.SINGLE, price: 50, booked: false },
      ];

      (prisma.room.findMany as jest.Mock).mockResolvedValue(rooms);

      const result = await resolvers.Query.availableRooms();
      expect(result).toEqual(rooms);
    });

    it('should return all bookings', async () => {
      const bookings: Booking[] = [
        { id: 1, roomId: 2, userId: 1, startDate: new Date(), endDate: new Date() }
      ];

      (prisma.booking.findMany as jest.Mock).mockResolvedValue(bookings);

      const result = await resolvers.Query.bookings();
      expect(result).toEqual(bookings);
    });

    it('should return a booking by its id', async () => {
      const booking: Booking = {
        id: 1, roomId: 2, userId: 1, startDate: new Date(), endDate: new Date()
      };

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(booking);

      const result = await resolvers.Query.booking({}, { id: 1 });
      expect(result).toEqual(booking);
    });

    it('should return all users', async () => {
      const users: User[] = [
        { id: 1, email: 'test@email.com', password: 'testPassword', fullName: 'John Doe', role: UserRole.CUSTOMER }
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await resolvers.Query.users();
      expect(result).toEqual(users);
    });

    it('should return a user by its id', async () => {
      const user: User = {
        id: 1, email: 'test@email.com', password: 'testPassword', fullName: 'John Doe', role: UserRole.CUSTOMER
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);

      const result = await resolvers.Query.user({}, { id: 1 });
      expect(result).toEqual(user);
    });

  });


  describe('Mutation Resolvers', () => {

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Mutation Resolvers', () => {

      afterEach(() => {
        jest.clearAllMocks();
      });

      describe('bookRoom', () => {
        it('should successfully book a room', async () => {
          const input = {
            userId: 1,
            roomId: 2,
            startDate: new Date(),
            endDate: new Date()
          };

          const mockUser: User = {
            id: 1,
            email: 'test@email.com',
            password: 'hashedPasswordForTest',
            fullName: 'John Doe',
            role: UserRole.CUSTOMER
          };

          const room: Room = { id: 2, type: RoomType.SINGLE, price: 50, booked: false };
          const booking: Booking = { ...input, id: 1 };

          (prisma.room.findFirst as jest.Mock).mockResolvedValueOnce(room);
          (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce(null);
          (prisma.booking.create as jest.Mock).mockResolvedValue(booking);

          const result = await resolvers.Mutation.bookRoom({}, input, { user: mockUser });
          expect(result).toEqual(booking);
        });

      });

    });



    describe('register', () => {
      it('should successfully register a new user', async () => {
        const input = {
          email: 'test2@email.com',
          password: 'testPassword',
          fullName: 'Jane Doe',
          role: UserRole.CUSTOMER
        };

        const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
        const user: User = { id: 2, ...input, password: hashedPassword };

        (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
        (prisma.user.create as jest.Mock).mockResolvedValue(user);

        const result = await resolvers.Mutation.register({}, input, {});
        expect(result.user).toEqual(expect.objectContaining({ id: 2, email: input.email, fullName: input.fullName, role: input.role }));
        expect(jwt.verify(result.token, JWT_SECRET)).toBeTruthy();
      });

    });

    describe('login', () => {
      it('should successfully login a user', async () => {
        const input = {
          email: 'test@email.com',
          password: 'testPassword'
        };

        const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
        const user: User = { id: 1, email: input.email, password: hashedPassword, fullName: 'John Doe', role: UserRole.CUSTOMER };

        (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);

        const result = await resolvers.Mutation.login({}, input);
        expect(result.user).toEqual(expect.objectContaining({ id: 1, email: input.email, fullName: 'John Doe', role: UserRole.CUSTOMER }));
        expect(jwt.verify(result.token, JWT_SECRET)).toBeTruthy();
      });

    });

    describe('createRoom', () => {
      it('should fail if user is not authenticated', async () => {
        await expect(resolvers.Mutation.createRoom({}, { type: RoomType.DELUXE, price: 100 }, {}))
          .rejects.toThrow('UNAUTHENTICATED');
      });

      it('should fail if user is not an admin', async () => {
        const nonAdminUser: User = {
          id: 2,
          email: 'test2@email.com',
          password: 'hashedPasswordForTest',
          fullName: 'Jane Doe',
          role: UserRole.CUSTOMER
        };

        await expect(resolvers.Mutation.createRoom({}, { type: RoomType.DELUXE, price: 100 }, { user: nonAdminUser }))
          .rejects.toThrow('INSUFFICIENT_PERMISSIONS');
      });

      it('should create a room if user is an admin', async () => {
        const adminUser: User = {
          id: 1,
          email: 'admin@email.com',
          password: 'hashedPasswordForAdmin',
          fullName: 'Admin User',
          role: UserRole.ADMIN
        };

        const newRoom: Room = {
          id: 3,
          type: RoomType.DELUXE,
          price: 100,
          booked: false
        };

        (prisma.room.create as jest.Mock).mockResolvedValue(newRoom);

        const result = await resolvers.Mutation.createRoom({}, { type: RoomType.DELUXE, price: 100 }, { user: adminUser });
        expect(result).toEqual(newRoom);
      });
    });

    describe('updateRoom', () => {
      it('should fail if user is not an admin', async () => {
        const nonAdminUser: User = {
          id: 2,
          email: 'test2@email.com',
          password: 'hashedPasswordForTest',
          fullName: 'Jane Doe',
          role: UserRole.CUSTOMER
        };

        await expect(resolvers.Mutation.updateRoom({}, { id: 1, type: RoomType.DELUXE, price: 150 }, { user: nonAdminUser }))
          .rejects.toThrow('INSUFFICIENT_PERMISSIONS');
      });

      it('should throw an error if the room is not found', async () => {
        const adminUser: User = {
          id: 1,
          email: 'admin@email.com',
          password: 'hashedPasswordForAdmin',
          fullName: 'Admin User',
          role: UserRole.ADMIN
        };

        prismaMock.room.findFirst.mockResolvedValue(null);

        await expect(resolvers.Mutation.updateRoom({}, { id: 999, type: RoomType.DELUXE, price: 150 }, { user: adminUser }))
          .rejects.toThrow('ROOM_NOT_FOUND');
      });

      it('should successfully update the room', async () => {
        const adminUser: User = {
          id: 1,
          email: 'admin@email.com',
          password: 'hashedPasswordForAdmin',
          fullName: 'Admin User',
          role: UserRole.ADMIN
        };

        const updatedRoom: Room = {
          id: 1,
          type: RoomType.DELUXE,
          price: 150,
          booked: false
        };

        prismaMock.room.findFirst.mockResolvedValue(updatedRoom);
        prismaMock.room.update.mockResolvedValue(updatedRoom);

        const result = await resolvers.Mutation.updateRoom({}, { id: 1, type: RoomType.DELUXE, price: 150 }, { user: adminUser });
        expect(result).toEqual(updatedRoom);
      });
    });

    describe('deleteRoom', () => {
      it('should fail if user is not an admin', async () => {
        const nonAdminUser: User = {
          id: 2,
          email: 'test2@email.com',
          password: 'hashedPasswordForTest',
          fullName: 'Jane Doe',
          role: UserRole.CUSTOMER
        };

        await expect(resolvers.Mutation.deleteRoom({}, { id: "1" }, { user: nonAdminUser }))
          .rejects.toThrow('INSUFFICIENT_PERMISSIONS');
      });

      it('should throw an error if the room is not found', async () => {
        const adminUser: User = {
          id: 1,
          email: 'admin@email.com',
          password: 'hashedPasswordForAdmin',
          fullName: 'Admin User',
          role: UserRole.ADMIN
        };

        prismaMock.room.findFirst.mockResolvedValue(null);

        await expect(resolvers.Mutation.deleteRoom({}, { id: "999" }, { user: adminUser }))
          .rejects.toThrow('ROOM_NOT_FOUND');
      });

      it('should successfully delete the room', async () => {
        const adminUser: User = {
          id: 1,
          email: 'admin@email.com',
          password: 'hashedPasswordForAdmin',
          fullName: 'Admin User',
          role: UserRole.ADMIN
        };

        const roomToBeDeleted: Room = {
          id: 1,
          type: RoomType.DELUXE,
          price: 150,
          booked: false
        };

        prismaMock.room.findFirst.mockResolvedValue(roomToBeDeleted);
        prismaMock.room.delete.mockResolvedValue(roomToBeDeleted);

        const result = await resolvers.Mutation.deleteRoom({}, { id: "1" }, { user: adminUser });
        expect(result).toEqual(roomToBeDeleted);
      });
    });

    describe('cancelBooking', () => {

      it('should throw an error if the booking is not found', async () => {
        const user: User = {
          id: 2,
          email: 'test2@email.com',
          password: 'hashedPasswordForTest',
          fullName: 'Jane Doe',
          role: UserRole.CUSTOMER
        };

        prismaMock.booking.findFirst.mockResolvedValue(null);
        prismaMock.booking.delete.mockResolvedValue(null);

        await expect(resolvers.Mutation.cancelBooking({}, { id: 999 }, { user }))
          .rejects.toThrow('BOOKING_NOT_FOUND');
      });

      it('should successfully cancel the booking if user is the owner', async () => {
        const user: User = {
          id: 2,
          email: 'test2@email.com',
          password: 'hashedPasswordForTest',
          fullName: 'Jane Doe',
          role: UserRole.CUSTOMER
        };

        const booking: Booking = {
          id: 1,
          roomId: 2,
          userId: 2,
          startDate: new Date('2023-09-01T10:20:30Z'),
          endDate: new Date('2023-09-05T10:20:30Z')
        };

        prismaMock.booking.findFirst.mockResolvedValue(booking);
        prismaMock.booking.delete.mockResolvedValue(booking);

        const result = await resolvers.Mutation.cancelBooking({}, { id: 1 }, { user });
        expect(result).toEqual(booking);
      });

      it('should successfully cancel the booking if user is an admin', async () => {
        const adminUser: User = {
          id: 1,
          email: 'admin@email.com',
          password: 'hashedPasswordForAdmin',
          fullName: 'Admin User',
          role: UserRole.ADMIN
        };

        const booking: Booking = {
          id: 1,
          roomId: 2,
          userId: 2,
          startDate: new Date('2023-09-01T10:20:30Z'),
          endDate: new Date('2023-09-05T10:20:30Z')
        };

        prismaMock.booking.findFirst.mockResolvedValue(booking);
        prismaMock.booking.delete.mockResolvedValue(booking);

        const result = await resolvers.Mutation.cancelBooking({}, { id: 1 }, { user: adminUser });
        expect(result).toEqual(booking);
      });
    });

  });
});
