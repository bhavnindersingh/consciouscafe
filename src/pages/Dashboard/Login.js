import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { error } = await signIn({ email, password });
            if (error) throw error;
            navigate('/dashboard');
        } catch (error) {
            setError('Failed to sign in: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">🧘</div>
                        <h1 className="auth-title">Facilitator Login</h1>
                        <p className="auth-subtitle">Sign in to your facilitator account</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <div className="auth-error">{error}</div>}

                        <div className="auth-input-group">
                            <label htmlFor="email" className="auth-label">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="auth-input"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="auth-input-group">
                            <label htmlFor="password" className="auth-label">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="auth-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-button"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="auth-footer">
                            Don't have an account?{' '}
                            <Link to="/request-facilitator-access" className="auth-link">
                                Request Facilitator Access
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
