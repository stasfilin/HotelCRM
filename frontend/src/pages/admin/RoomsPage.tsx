import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { useTable, Column, Row, CellProps } from 'react-table';
import { isLoggedIn, getCurrentUser } from '../../utils/auth';
import { RoomType, UserRole } from '../../utils/enums';
import { CREATE_ROOM_MUTATION, UPDATE_ROOM_MUTATION, DELETE_ROOM_MUTATION } from '../../graphql/mutations';
import { AVAILABLE_ROOMS_QUERY } from '../../graphql/queries';
import '../../styles/RoomsPage.css';
import { Room } from '../../utils/types';

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

    const [deleteRoom] = useMutation(DELETE_ROOM_MUTATION, {
        onCompleted: () => {
            setFeedback({ message: 'Room successfully deleted!', type: 'success' });
        },
        onError: (err) => {
            setFeedback({ message: err.message, type: 'error' });
        },
        refetchQueries: [{ query: AVAILABLE_ROOMS_QUERY }]
    });

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

    const handleDelete = async (id: string) => {
        try {
            await deleteRoom({ variables: { id } });
        } catch (err) { }
    };

    const columns: Column<Room>[] = React.useMemo(() => [
        { Header: 'ID', accessor: 'id' as const },
        { Header: 'Type', accessor: 'type' as const },
        { Header: 'Price', accessor: 'price' as const },
        {
            Header: 'Booked',
            accessor: 'booked' as const,
            Cell: ({ value }: CellProps<Room, boolean>) => <>{value.toString()}</>
        },
        {
            Header: 'Actions',
            id: 'actions',
            accessor: (row: Room) => row.id,
            Cell: ({ row }: { row: Row<Room> }) => (
                <div className="table-action-buttons">
                    <button className="edit-button" onClick={() => { setSelectedRoom(row.original); setShowModal(true); }}>Edit</button>
                    <button className="delete-button" onClick={() => handleDelete(row.original.id)}>Delete</button>
                </div>
            ),
        }
    ], []);

    const tableInstance = useTable({ columns, data: data?.availableRooms || [] });

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

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
                        <select name="type" className="room-input" defaultValue={selectedRoom ? selectedRoom.type : ''}>
                            {Object.values(RoomType).map(roomType => (
                                <option key={roomType} value={roomType}>{roomType}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Price:</label>
                        <input className="room-input" type="number" name="price" defaultValue={selectedRoom ? selectedRoom.price.toString() : ''} />
                    </div>
                    <div className="form-buttons">
                        <button className="room-button" type="submit">Submit</button>
                        <button className="cancel-button" onClick={() => { setShowModal(false); setSelectedRoom(null); }}>Cancel</button>
                    </div>
                </form>
            )}
            <table className="admin-table" {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map(row => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <button className="admin-button" onClick={() => { setShowModal(true); setSelectedRoom(null); }}>Add New Room</button>
        </div>
    );
};