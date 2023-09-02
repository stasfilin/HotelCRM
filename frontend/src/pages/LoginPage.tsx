import React, { useEffect, useState } from 'react';
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "../graphql/mutations";
import { isLoggedIn } from "../utils/auth";
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

export const LoginPage: React.FC = () => {
    const [login, { loading, error, data }] = useMutation(LOGIN_MUTATION);
    const navigate = useNavigate();

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (isLoggedIn()) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formElements = e.currentTarget.elements as unknown as typeof e.currentTarget & {
            email: { value: string };
            password: { value: string };
        };

        const emailValue = formElements.email.value;
        const passwordValue = formElements.password.value;

        try {
            const { data } = await login({ variables: { email: emailValue, password: passwordValue } });

            localStorage.setItem('token', data.login.token);
            navigate('/');

        } catch (err) {
            if (err instanceof Error) {
                setErrorMsg(err.message || 'Error logging in. Please try again.');
            }
        }
    };


    return (
        <div className="login-page-container">
            <h1 className="login-title">Login</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Email"
                    className="login-input"
                    name="email"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="login-input"
                    name="password"
                    required
                />

                <button type="submit" className="login-button">Login</button>
                {errorMsg && <div className="login-error">{errorMsg}</div>}
            </form>
            <div className="register-link-container">
                <Link to="/register" className="App-text-link">Go to Register Page</Link>
            </div>

        </div>
    );
};

export default LoginPage;
