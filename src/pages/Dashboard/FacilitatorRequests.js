import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const FacilitatorRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError('');

            let query = supabase
                .from('facilitator_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setRequests(data || []);
        } catch (err) {
            setError(err.message || 'Error fetching requests');
        } finally {
            setLoading(false);
        }
    };

    const approveRequest = async (requestId, requestEmail, fullName, phoneNumber) => {
        if (!window.confirm('Approve this facilitator request? They will be able to register and create offerings.')) {
            return;
        }

        try {
            // First, add to approved_facilitators
            const { error: approveError } = await supabase
                .from('approved_facilitators')
                .insert([
                    {
                        email: requestEmail,
                        full_name: fullName,
                        phone_number: phoneNumber,
                        approved_by: user.id
                    }
                ]);

            if (approveError) {
                // If email already exists in approved_facilitators, just update the request
                if (approveError.code === '23505') {
                    // Unique constraint violation - email already approved
                    console.log('Email already in approved_facilitators, updating request status only');
                } else {
                    throw approveError;
                }
            }

            // Update request status
            const { error: updateError } = await supabase
                .from('facilitator_requests')
                .update({
                    status: 'approved',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user.id
                })
                .eq('id', requestId);

            if (updateError) throw updateError;

            // Refresh the list
            fetchRequests();

            alert('Request approved! The user can now register.');
        } catch (err) {
            setError(err.message || 'Error approving request');
        }
    };

    const rejectRequest = async (requestId) => {
        const reason = window.prompt('Reason for rejection (optional - will be stored as admin note):');
        if (reason === null) return; // User cancelled

        try {
            const { error: updateError } = await supabase
                .from('facilitator_requests')
                .update({
                    status: 'rejected',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user.id,
                    admin_notes: reason || 'Rejected'
                })
                .eq('id', requestId);

            if (updateError) throw updateError;

            // Refresh the list
            fetchRequests();

            alert('Request rejected.');
        } catch (err) {
            setError(err.message || 'Error rejecting request');
        }
    };

    const deleteRequest = async (requestId) => {
        if (!window.confirm('Permanently delete this request? This cannot be undone.')) {
            return;
        }

        try {
            const { error: deleteError } = await supabase
                .from('facilitator_requests')
                .delete()
                .eq('id', requestId);

            if (deleteError) throw deleteError;

            // Refresh the list
            fetchRequests();
        } catch (err) {
            setError(err.message || 'Error deleting request');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'dashboard-badge dashboard-badge-pending';
            case 'approved':
                return 'dashboard-badge dashboard-badge-approved';
            case 'rejected':
                return 'dashboard-badge dashboard-badge-declined';
            default:
                return 'dashboard-badge';
        }
    };

    if (loading) {
        return (
            <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">⏳</div>
                <h2 className="dashboard-empty-title">Loading requests...</h2>
            </div>
        );
    }

    return (
        <div>
            <div className="dashboard-page-header">
                <h1 className="dashboard-page-title">Facilitator Access Requests</h1>
                <p className="dashboard-page-subtitle">
                    Review and approve people who want to become facilitators
                </p>
            </div>

            {error && (
                <div className="dashboard-alert dashboard-alert-error">
                    {error}
                </div>
            )}

            {/* Filter Buttons */}
            <div className="dashboard-page-actions">
                <button
                    onClick={() => setFilter('pending')}
                    className={`dashboard-button ${filter === 'pending' ? 'dashboard-button-primary' : 'dashboard-button-secondary'} dashboard-button-small`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`dashboard-button ${filter === 'approved' ? 'dashboard-button-primary' : 'dashboard-button-secondary'} dashboard-button-small`}
                >
                    Approved
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={`dashboard-button ${filter === 'rejected' ? 'dashboard-button-primary' : 'dashboard-button-secondary'} dashboard-button-small`}
                >
                    Rejected
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`dashboard-button ${filter === 'all' ? 'dashboard-button-primary' : 'dashboard-button-secondary'} dashboard-button-small`}
                >
                    All ({requests.length})
                </button>
            </div>

            {requests.length === 0 ? (
                <div className="dashboard-empty-state">
                    <div className="dashboard-empty-icon">📭</div>
                    <h2 className="dashboard-empty-title">No Requests Yet</h2>
                    <p className="dashboard-empty-message">
                        {filter === 'pending'
                            ? "No pending requests at the moment."
                            : `No ${filter} requests found.`}
                    </p>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {requests.map((request) => (
                        <div key={request.id} className="dashboard-card">
                            <div className="dashboard-card-header">
                                <h3 className="dashboard-card-title">{request.full_name}</h3>
                                <span className={getStatusBadgeClass(request.status)}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                            </div>

                            <div className="dashboard-card-body">
                                <div style={{ marginBottom: '12px' }}>
                                    <strong>Email:</strong><br />
                                    <a href={`mailto:${request.email}`} style={{ color: 'var(--color-primary)' }}>
                                        {request.email}
                                    </a>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <strong>Phone:</strong><br />
                                    <a href={`tel:${request.phone_number}`} style={{ color: 'var(--color-primary)' }}>
                                        {request.phone_number}
                                    </a>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <strong>Message:</strong><br />
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: 'var(--color-bg)',
                                        borderRadius: '4px',
                                        marginTop: '8px',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {request.message || 'No message provided'}
                                    </div>
                                </div>

                                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                    <strong>Requested:</strong> {formatDate(request.created_at)}
                                </div>

                                {request.reviewed_at && (
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        <strong>Reviewed:</strong> {formatDate(request.reviewed_at)}
                                    </div>
                                )}

                                {request.admin_notes && (
                                    <div style={{ marginTop: '12px' }}>
                                        <strong>Admin Notes:</strong><br />
                                        <div style={{
                                            padding: '8px',
                                            backgroundColor: '#fef3c7',
                                            borderRadius: '4px',
                                            marginTop: '4px',
                                            fontSize: '13px'
                                        }}>
                                            {request.admin_notes}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {request.status === 'pending' && (
                                <div className="dashboard-card-actions">
                                    <button
                                        onClick={() => approveRequest(request.id, request.email, request.full_name, request.phone_number)}
                                        className="dashboard-button dashboard-button-primary dashboard-button-small"
                                    >
                                        ✓ Approve
                                    </button>
                                    <button
                                        onClick={() => rejectRequest(request.id)}
                                        className="dashboard-button dashboard-button-secondary dashboard-button-small"
                                    >
                                        ✕ Reject
                                    </button>
                                    <button
                                        onClick={() => deleteRequest(request.id)}
                                        className="dashboard-button dashboard-button-danger dashboard-button-small"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}

                            {request.status !== 'pending' && (
                                <div className="dashboard-card-actions">
                                    <button
                                        onClick={() => deleteRequest(request.id)}
                                        className="dashboard-button dashboard-button-danger dashboard-button-small"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FacilitatorRequests;
