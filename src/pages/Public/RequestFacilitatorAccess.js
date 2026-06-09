import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase/supabaseClient';

const RequestFacilitatorAccess = () => {
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        phone_number: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Submit the request - database UNIQUE constraint will handle duplicates
            const { error: insertError } = await supabase
                .from('facilitator_requests')
                .insert([
                    {
                        ...formData,
                        status: 'pending'
                    }
                ]);

            if (insertError) {
                // Handle duplicate email error
                if (insertError.code === '23505') {
                    throw new Error('This email already has a request submitted. Please check your email for updates or contact us.');
                }
                throw insertError;
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <div className="auth-logo">✅</div>
                            <h1 className="auth-title">Request Submitted!</h1>
                            <p className="auth-subtitle">Thank you for your interest in becoming a facilitator</p>
                        </div>

                        <div className="dashboard-empty-state" style={{ margin: '32px 0' }}>
                            <div className="dashboard-empty-icon">📧</div>
                            <h2 className="dashboard-empty-title">What happens next?</h2>
                            <div style={{ textAlign: 'left', maxWidth: '400px', margin: '24px auto' }}>
                                <p style={{ marginBottom: '12px' }}>
                                    <strong>1. Review</strong><br />
                                    We'll review your request within 1-2 business days.
                                </p>
                                <p style={{ marginBottom: '12px' }}>
                                    <strong>2. Notification</strong><br />
                                    You'll receive an email at <strong>{formData.email}</strong> once approved.
                                </p>
                                <p style={{ marginBottom: '12px' }}>
                                    <strong>3. Registration</strong><br />
                                    After approval, you can register and start creating offerings!
                                </p>
                            </div>
                        </div>

                        <Link to="/" className="dashboard-button dashboard-button-primary">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">🌱</div>
                        <h1 className="auth-title">Request Facilitator Access</h1>
                        <p className="auth-subtitle">
                            Join Conscious Sanctuary as a facilitator to host workshops, events, and retreats
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <div className="auth-error">{error}</div>}

                        <div className="auth-input-group">
                            <label htmlFor="full_name" className="auth-label">
                                Full Name *
                            </label>
                            <input
                                id="full_name"
                                type="text"
                                name="full_name"
                                required
                                className="auth-input"
                                placeholder="Your full name"
                                value={formData.full_name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="auth-input-group">
                            <label htmlFor="email" className="auth-label">
                                Email Address *
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                className="auth-input"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                We'll notify you at this email once approved
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label htmlFor="phone_number" className="auth-label">
                                Phone Number *
                            </label>
                            <input
                                id="phone_number"
                                type="tel"
                                name="phone_number"
                                required
                                className="auth-input"
                                placeholder="+91 XXXXX XXXXX"
                                value={formData.phone_number}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="auth-input-group">
                            <label htmlFor="message" className="auth-label">
                                Why do you want to become a facilitator? *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={5}
                                className="dashboard-textarea"
                                style={{
                                    width: '100%',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '15px',
                                    padding: '12px 16px',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '4px'
                                }}
                                placeholder="Tell us about your experience, what you'd like to offer, and why you want to be part of Conscious Sanctuary..."
                                value={formData.message}
                                onChange={handleChange}
                                disabled={loading}
                                minLength={50}
                            />
                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                Minimum 50 characters. Be specific about your offerings and experience.
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-button"
                        >
                            {loading ? 'Submitting Request...' : 'Submit Request'}
                        </button>

                        <div className="auth-footer">
                            Already approved?{' '}
                            <Link to="/register" className="auth-link">
                                Complete Registration
                            </Link>
                        </div>

                        <div className="auth-footer">
                            Already have an account?{' '}
                            <Link to="/facilitator-login" className="auth-link">
                                Sign In
                            </Link>
                        </div>

                        <div className="auth-footer">
                            <Link to="/" className="auth-link">
                                ← Back to Home
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RequestFacilitatorAccess;
