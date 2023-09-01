import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "./graph";
import { encryptData } from "./utils/auth";


export const LoginPage: React.FC = () => {
    const [login, { loading, error, data }] = useMutation(LOGIN_MUTATION);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const email = (e.currentTarget.elements[0] as HTMLInputElement).value;
        const password = (e.currentTarget.elements[1] as HTMLInputElement).value;

        try {
            const { data } = await login({ variables: { email, password } });

            console.log(data);

            localStorage.setItem('token', data.login.token);
            localStorage.setItem('user', encryptData(JSON.stringify(data.login.user)));

            alert('Login successful!');
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
        </div>
    );
};

export default LoginPage;
