import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { isLoggedIn } from '../../utils/auth';
import { UserRole } from '../../utils/enums';
import { getCurrentUser } from '../../utils/auth';

export const CustomerPage: React.FC = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        if (!isLoggedIn() || !user || user.role !== UserRole.CUSTOMER) {
            navigate('/login');
        }
    }, [navigate, user]);

    return (
        <div className="App-header">
            <h1>Customer Dashboard</h1>
        </div>
    );
};
