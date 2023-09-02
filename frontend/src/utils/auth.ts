import jwtDecode from 'jwt-decode';
import { UserRole } from './enums';

export function isLoggedIn(): boolean {
    const token = getToken();

    if (!token) return false;

    try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        const isValid = decodedToken.exp > currentTime;

        if (!isValid) {
            removeToken();
        }

        return isValid;
    } catch (err) {
        console.error('Error decoding the token', err);
        return false;
    }
}

export function getToken(): string | null {
    return localStorage.getItem('token');
}

export function removeToken(): void {
    localStorage.removeItem('token');
}

export function decodeUser() {
    const token = getToken();
    if (!token) return null;

    try {
        return jwtDecode(token);
    } catch (err) {
        console.error('Error decoding the token', err);
        return null;
    }
}

export function getCurrentUser(): { id: any, email: any, role?: UserRole } | null {
    const token = getToken();
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
