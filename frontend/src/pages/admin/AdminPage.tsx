import React, { useEffect } from 'react';
import {
    useNavigate
} from 'react-router-dom';

import { isLoggedIn } from '../../utils/auth';
import { UserRole } from '../../utils/enums';
import { getCurrentUser } from '../../utils/auth';

export const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        if (!isLoggedIn() || !user || user.role !== UserRole.ADMIN) {
            navigate('/login');
        }
    }, [navigate, user]);


    return (
        <div className="App-header">
            <h1>Admin Dashboard</h1>
        </div>
    );
};