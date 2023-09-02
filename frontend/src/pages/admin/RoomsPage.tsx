import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { isLoggedIn, getCurrentUser } from '../../utils/auth';
import { RoomType, UserRole } from '../../utils/enums';
import { CREATE_ROOM_MUTATION, UPDATE_ROOM_MUTATION, DELETE_ROOM_MUTATION } from '../../graphql/mutations';
import { AVAILABLE_ROOMS_QUERY } from '../../graphql/queries';
import { Room } from '../../utils/types';
import '../../styles/RoomsPage.css';

export const RoomsPage: React.FC = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

    const { loading, error, data } = useQuery<{ availableRooms: Room[] }>(AVAILABLE_ROOMS_QUERY);

    const [createRoom] = useMutation(CREATE_ROOM_MUTATION, {
        refetchQueries: [{ query: AVAILABLE_ROOMS_QUERY }]
    });

    const [updateRoom] = useMutation(UPDATE_ROOM_MUTATION, {
        refetchQueries: [{ query: AVAILABLE_ROOMS_QUERY }]
    });

    const [deleteRoom] = useMutation(DELETE_ROOM_MUTATION);

    useEffect(() => {
        if (!isLoggedIn() || !user || user.role !== UserRole.ADMIN) {
            navigate('/login');
        }
    }, [navigate, user]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const type = form.type.value;
        const price = parseFloat(form.price.value);

        try {
            if (selectedRoom) {
                await updateRoom({ variables: { id: selectedRoom.id, type, price } });
            } else {
                await createRoom({ variables: { type, price } });
            }

            setShowModal(false);
            setSelectedRoom(null);
            setFeedback({ message: 'Operation successful!', type: 'success' });
        } catch (err) {
            if (err instanceof Error) {
                setFeedback({ message: err.message, type: 'error' });
            } else {
                setFeedback({ message: "An unexpected error occurred.", type: 'error' });
            }
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="App-header">
            <h1>Admin Dashboard</h1>
            {feedback && <div className={`feedback-${feedback.type}`}>{feedback.message}</div>}
            {showModal && (
                <form onSubmit={handleSubmit} className="room-form">
                    <div className="form-group">
                        <label>Type:</label>
                        <select name="type" className="login-input" defaultValue={selectedRoom ? selectedRoom.type : ''}>
                            {Object.values(RoomType).map(roomType => (
                                <option key={roomType} value={roomType}>{roomType}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Price:</label>
                        <input className="login-input" type="number" name="price" defaultValue={selectedRoom ? selectedRoom.price.toString() : ''} />
                    </div>
                    <div className="form-buttons">
                        <button className="login-button" type="submit">Submit</button>
                        <button className="cancel-button" onClick={() => { setShowModal(false); setSelectedRoom(null); }}>Cancel</button>
                    </div>
                </form>
            )}
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Booked</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.availableRooms.map(room => (
                        <tr key={room.id}>
                            <td>{room.id}</td>
                            <td>{room.type}</td>
                            <td>{room.price}</td>
                            <td>{room.booked.toString()}</td>
                            <td>
                                <div className="table-action-buttons">
                                    <button className="edit-button" onClick={() => { setSelectedRoom(room); setShowModal(true); }}>Edit</button>
                                    <button className="delete-button" onClick={() => deleteRoom({ variables: { id: room.id } })}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="admin-button" onClick={() => { setShowModal(true); setSelectedRoom(null); }}>Add New Room</button>
        </div>
    );
};