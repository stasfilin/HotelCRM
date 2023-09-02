import React, { useEffect } from 'react';
import { useMutation } from "@apollo/client";
import { REGISTER_MUTATION } from "./graph";
import { isLoggedIn } from "./utils/auth";
import { useNavigate } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
    const [register, { loading, error, data }] = useMutation(REGISTER_MUTATION);
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn()) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const fullName = (e.currentTarget.elements[0] as HTMLInputElement).value;
        const email = (e.currentTarget.elements[1] as HTMLInputElement).value;
        const password = (e.currentTarget.elements[2] as HTMLInputElement).value;
        const role = "CUSTOMER";

        try {
            const { data } = await register({ variables: { email, password, fullName, role } });

            localStorage.setItem('token', data.register.token);

            navigate('/');

        } catch (err) {
            alert('Error registering. Please try again.');
        }
    };

    return (
        <div className="App-header">
            <h1>Register</h1>
            <form className="register-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Full Name"
                    className="register-input"
                />
                <input
                    type="text"
                    placeholder="Email"
                    className="register-input"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="register-input"
                    required
                />
                <button type="submit" className="register-button">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;
