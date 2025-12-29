import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const RSVPList = () => {
    const { user } = useAuth();
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, approved, declined

    useEffect(() => {
        if (user) {
            fetchRSVPs();
        }
    }, [user, filter]);

    const fetchRSVPs = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch RSVPs for offerings created by this instructor
            let query = supabase
                .from('rsvps')
                .select(`
                    *,
                    offerings:offering_id (
                        id,
                        title,
                        type,
                        date,
                        location
                    )
                `)
                .order('created_at', { ascending: false });

            // Apply filter
            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data: allRsvps, error: rsvpError } = await query;

            if (rsvpError) throw rsvpError;

            // Filter RSVPs to only include those for the instructor's offerings
            const { data: instructorOfferings, error: offeringsError } = await supabase
                .from('offerings')
                .select('id')
                .eq('instructor_id', user.id);

            if (offeringsError) throw offeringsError;

            const offeringIds = instructorOfferings.map(o => o.id);
            const filteredRsvps = allRsvps.filter(rsvp =>
                rsvp.offerings && offeringIds.includes(rsvp.offerings.id)
            );

            setRsvps(filteredRsvps);
        } catch (err) {
            setError(err.message || 'Error fetching RSVPs');
        } finally {
            setLoading(false);
        }
    };

    const updateRSVPStatus = async (rsvpId, newStatus) => {
        try {
            const { error: updateError } = await supabase
                .from('rsvps')
                .update({ status: newStatus })
                .eq('id', rsvpId);

            if (updateError) throw updateError;

            // Refresh the list
            fetchRSVPs();
        } catch (err) {
            setError(err.message || 'Error updating RSVP status');
        }
    };

    const deleteRSVP = async (rsvpId) => {
        if (!window.confirm('Are you sure you want to delete this RSVP?')) {
            return;
        }

        try {
            const { error: deleteError } = await supabase
                .from('rsvps')
                .delete()
                .eq('id', rsvpId);

            if (deleteError) throw deleteError;

            // Refresh the list
            fetchRSVPs();
        } catch (err) {
            setError(err.message || 'Error deleting RSVP');
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
            case 'declined':
                return 'dashboard-badge dashboard-badge-declined';
            default:
                return 'dashboard-badge';
        }
    };

    const getOfferingTypeBadge = (type) => {
        const badges = {
            'workshop': '🧘',
            'event': '🎉',
            'retreat': '🌄'
        };
        return badges[type] || '📅';
    };

    if (loading) {
        return (
            <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">⏳</div>
                <h2 className="dashboard-empty-title">Loading RSVPs...</h2>
            </div>
        );
    }

    return (
        <div>
            <div className="dashboard-page-header">
                <h1 className="dashboard-page-title">RSVPs</h1>
                <p className="dashboard-page-subtitle">
                    Manage registrations for your workshops, events, and retreats
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
                    onClick={() => setFilter('all')}
                    className={`dashboard-button ${filter === 'all' ? 'dashboard-button-primary' : 'dashboard-button-secondary'} dashboard-button-small`}
                >
                    All ({rsvps.length})
                </button>
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
                    onClick={() => setFilter('declined')}
                    className={`dashboard-button ${filter === 'declined' ? 'dashboard-button-primary' : 'dashboard-button-secondary'} dashboard-button-small`}
                >
                    Declined
                </button>
            </div>

            {rsvps.length === 0 ? (
                <div className="dashboard-empty-state">
                    <div className="dashboard-empty-icon">📭</div>
                    <h2 className="dashboard-empty-title">No RSVPs Yet</h2>
                    <p className="dashboard-empty-message">
                        {filter === 'all'
                            ? "You don't have any RSVPs yet. When people register for your offerings, they'll appear here."
                            : `No ${filter} RSVPs found.`}
                    </p>
                </div>
            ) : (
                <div className="dashboard-table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Offering</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Guest</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Registered</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rsvps.map((rsvp) => (
                                <tr key={rsvp.id}>
                                    <td>
                                        <strong>{rsvp.offerings?.title || 'N/A'}</strong>
                                        {rsvp.offerings?.location && (
                                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                                📍 {rsvp.offerings.location}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '20px' }}>
                                            {getOfferingTypeBadge(rsvp.offerings?.type)}
                                        </span>
                                    </td>
                                    <td>{formatDate(rsvp.offerings?.date)}</td>
                                    <td>
                                        <strong>{rsvp.user_name}</strong>
                                        {rsvp.message && (
                                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                                💬 {rsvp.message}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <a href={`mailto:${rsvp.user_email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                            {rsvp.user_email}
                                        </a>
                                        {rsvp.user_phone && (
                                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                                📞 {rsvp.user_phone}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={getStatusBadgeClass(rsvp.status)}>
                                            {rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                        {formatDate(rsvp.created_at)}
                                    </td>
                                    <td>
                                        <div className="dashboard-card-actions">
                                            {rsvp.status !== 'approved' && (
                                                <button
                                                    onClick={() => updateRSVPStatus(rsvp.id, 'approved')}
                                                    className="dashboard-button dashboard-button-secondary dashboard-button-small"
                                                    title="Approve RSVP"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            {rsvp.status !== 'declined' && (
                                                <button
                                                    onClick={() => updateRSVPStatus(rsvp.id, 'declined')}
                                                    className="dashboard-button dashboard-button-secondary dashboard-button-small"
                                                    title="Decline RSVP"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteRSVP(rsvp.id)}
                                                className="dashboard-button dashboard-button-danger dashboard-button-small"
                                                title="Delete RSVP"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RSVPList;
