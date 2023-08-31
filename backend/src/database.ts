export const rooms = [
  {
    id: "1",
    type: "SINGLE",
    price: 20.00,
    booked: false,
  },
  {
    id: "2",
    type: "DOUBLE",
    price: 35.00,
    booked: false,
  },
  {
    id: "3",
    type: "SUITE",
    price: 100.00,
    booked: true,
  },
];

export const users = [
  {
    id: "1",
    email: "john@hotel.com",
    password: "$2a$10$MTURGomOK7NsufunT5Xe0uJn0G.Q9Nhz9pPSDMAq58qi3nRFy.qOu",
    fullName: "John Doe",
    role: "CUSTOMER",
  },
  {
    id: "2",
    email: "admin@hotel.com",
    password: "$2a$10$MTURGomOK7NsufunT5Xe0uJn0G.Q9Nhz9pPSDMAq58qi3nRFy.qOu",
    role: "ADMIN",
  },
  {
    id: "3",
    email: "jane@hotel.com",
    password: "$2a$10$MTURGomOK7NsufunT5Xe0uJn0G.Q9Nhz9pPSDMAq58qi3nRFy.qOu",
    fullName: "Jane Smith",
    role: "CUSTOMER",
  },
];

export const bookings = [
  {
    id: "1",
    roomId: "3",
    userId: "1",
    startDate: "2023-09-01",
    endDate: "2023-09-07",
  },
];
