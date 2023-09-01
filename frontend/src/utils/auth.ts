import jwtDecode from 'jwt-decode';

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
