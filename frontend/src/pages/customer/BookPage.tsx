import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { getCurrentUser } from '../../utils/auth';
import { AVAILABLE_ROOMS_QUERY } from '../../graphql/queries';
import { BOOK_ROOM_MUTATION } from '../../graphql/mutations';
import '../../styles/BookPage.css';

export const BookPage: React.FC = () => {
    const { loading, error, data } = useQuery(AVAILABLE_ROOMS_QUERY);
    const [bookRoom] = useMutation(BOOK_ROOM_MUTATION);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const user = getCurrentUser();
    const today = new Date().toISOString().split('T')[0];


    const handleBookRoom = async (roomId: string) => {
        if (!user) {
            setErrorMsg('User is not defined.');
            return;
        }

        const parsedRoomId = parseInt(roomId, 10);
        if (isNaN(parsedRoomId)) {
            setErrorMsg('Invalid room ID: ' + roomId);
            return;
        }

        try {
            const response = await bookRoom({
                variables: {
                    userId: user.id,
                    roomId: parsedRoomId,
                    startDate: startDate,
                    endDate: endDate,
                },
            });
            console.log('Booking success:', response);
        } catch (error) {
            if (error instanceof Error) {
                setErrorMsg(error.message || 'Booking error. Please try again.');
            }
        }
    };

    return (
        <div className="book-page-container">
            <h1 className="book-title">Available Rooms</h1>

            <div className="date-selection">
                <input
                    type="date"
                    placeholder="Start Date"
                    className="date-input"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                    type="date"
                    placeholder="End Date"
                    className="date-input"
                    value={endDate}
                    min={startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1)).toISOString().split('T')[0] : today}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            <div className="room-list">
                {loading && <p>Loading...</p>}
                {error && <div className="booking-error">{error.message}</div>}
                {errorMsg && <div className="booking-error">{errorMsg}</div>}
                {data?.availableRooms.map((room: any) => (
                    <div key={room.id} className="room-item">
                        <p>{room.type} - ${room.price}</p>
                        <button
                            className="book-button"
                            onClick={() => handleBookRoom(room.id)}
                        >
                            Book this room
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookPage;
