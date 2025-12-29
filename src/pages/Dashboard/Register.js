import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase/supabaseClient';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingApproval, setCheckingApproval] = useState(false);
    const [approvedData, setApprovedData] = useState(null);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    // Check if email is approved when user enters it
    useEffect(() => {
        const checkApprovalStatus = async () => {
            if (!email || !email.includes('@')) return;

            setCheckingApproval(true);
            try {
                const { data, error } = await supabase
                    .from('approved_facilitators')
                    .select('id, email, full_name, phone_number, is_active')
                    .eq('email', email)
                    .eq('is_active', true)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error checking approval:', error);
                }

                setApprovedData(data);
            } catch (err) {
                console.error('Error checking approval:', err);
            } finally {
                setCheckingApproval(false);
            }
        };

        // Debounce the check
        const timeoutId = setTimeout(checkApprovalStatus, 500);
        return () => clearTimeout(timeoutId);
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if email is approved
        if (!approvedData) {
            return setError('This email is not approved to create a facilitator account. Please request access first.');
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        // Validate password strength
        if (password.length < 8) {
            return setError('Password must be at least 8 characters long');
        }

        try {
            setError('');
            setSuccess('');
            setLoading(true);

            // Create the auth account
            const { data: authData, error: signUpError } = await signUp({ email, password });
            if (signUpError) throw signUpError;

            // Update approved_facilitators with the user_id
            if (authData?.user?.id) {
                const { error: updateError } = await supabase
                    .from('approved_facilitators')
                    .update({ user_id: authData.user.id })
                    .eq('email', email);

                if (updateError) {
                    console.error('Error updating facilitator user_id:', updateError);
                }
            }

            // Show success message
            setSuccess('Registration successful! Please check your email for confirmation link.');

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/facilitator-login');
            }, 3000);
        } catch (error) {
            setError('Failed to create account: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">🌱</div>
                        <h1 className="auth-title">Complete Facilitator Registration</h1>
                        <p className="auth-subtitle">Complete your facilitator account setup</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <div className="auth-error">{error}</div>}
                        {success && <div className="auth-success">{success}</div>}

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
                            {checkingApproval && email && (
                                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                    Checking approval status...
                                </div>
                            )}
                            {!checkingApproval && email && !approvedData && email.includes('@') && (
                                <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '4px' }}>
                                    ❌ This email is not approved. <Link to="/request-facilitator-access" style={{ color: '#dc2626', textDecoration: 'underline' }}>Request access</Link>
                                </div>
                            )}
                            {!checkingApproval && approvedData && (
                                <div style={{ fontSize: '13px', color: '#059669', marginTop: '4px' }}>
                                    ✅ Email approved! Continue registration below.
                                </div>
                            )}
                        </div>

                        {approvedData && (
                            <>
                                <div className="auth-input-group">
                                    <label className="auth-label">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="auth-input"
                                        value={approvedData.full_name}
                                        disabled
                                        style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                                    />
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        From your approved application
                                    </div>
                                </div>

                                <div className="auth-input-group">
                                    <label className="auth-label">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="auth-input"
                                        value={approvedData.phone_number}
                                        disabled
                                        style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                                    />
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        From your approved application
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="auth-input-group">
                            <label htmlFor="password" className="auth-label">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="auth-input"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                minLength={8}
                            />
                            <div className="password-requirements">
                                <ul>
                                    <li>At least 8 characters long</li>
                                    <li>Use a mix of letters and numbers</li>
                                </ul>
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label htmlFor="confirmPassword" className="auth-label">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                className="auth-input"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success || !approvedData}
                            className="auth-button"
                        >
                            {loading ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account'}
                        </button>

                        {!approvedData && email && email.includes('@') && !checkingApproval && (
                            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', marginTop: '16px' }}>
                                <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#92400e' }}>
                                    Email not approved
                                </p>
                                <Link
                                    to="/request-facilitator-access"
                                    className="dashboard-button dashboard-button-primary dashboard-button-small"
                                    style={{ display: 'inline-block', marginTop: '8px' }}
                                >
                                    Request Facilitator Access
                                </Link>
                            </div>
                        )}

                        <div className="auth-footer">
                            Already have an account?{' '}
                            <Link to="/facilitator-login" className="auth-link">
                                Sign In
                            </Link>
                        </div>

                        <div className="auth-footer">
                            <Link to="/request-facilitator-access" className="auth-link">
                                Need facilitator access? Request here
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
