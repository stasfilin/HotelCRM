import React, { useEffect } from 'react';
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "../graph";
import { isLoggedIn } from "../utils/auth";
import { Link, useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const [login, { loading, error, data }] = useMutation(LOGIN_MUTATION);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn()) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const email = (e.currentTarget.elements[0] as HTMLInputElement).value;
        const password = (e.currentTarget.elements[1] as HTMLInputElement).value;

        try {
            const { data } = await login({ variables: { email, password } });

            localStorage.setItem('token', data.login.token);

            navigate('/');

        } catch (err) {
            alert('Error logging in. Please try again.');
        }
    };

    return (
        <div className="App-header">
            <h1>Login</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    className="login-input"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="login-input"
                    required
                />
                <button type="submit" className="login-button">Login</button>
            </form>
            <Link to="/register" className="App-text-link">Go to Register Page</Link>
        </div>
    );
};

export default LoginPage;
