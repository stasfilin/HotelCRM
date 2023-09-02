import { RoomType } from "./enums";

export type Room = {
    id: string;
    type: RoomType;
    price: number;
    booked: boolean;
};