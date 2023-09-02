import jwtDecode from 'jwt-decode';
import { UserRole } from './enums';

export function isLoggedIn(): boolean {
    const token = localStorage.getItem('token');

    if (!token) return false;

    try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        return decodedToken.exp > currentTime;
    } catch (err) {
        console.error('Error decoding the token', err);
        return false;
    }
}

export function decodeUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch (err) {
        console.error('Error decoding the token', err);
        return null;
    }
}

export function getCurrentUser(): { id: any, email: any, role?: UserRole } | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const user = jwtDecode(token) as { userId: any, email: any, role?: UserRole };

        console.log(user)
        return {
            id: user.userId,
            email: user.email,
            role: user.role || UserRole.CUSTOMER,
        };
    } catch (err) {
        console.error('Error decoding the token', err);
        return null;
    }
}
