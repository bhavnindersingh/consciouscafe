import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const RetreatList = () => {
    const [retreats, setRetreats] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchRetreats();
    }, [user]);

    const fetchRetreats = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('offerings')
                .select('*')
                .eq('instructor_id', user.id)
                .eq('type', 'retreat')
                .order('date', { ascending: false });

            if (error) throw error;
            setRetreats(data || []);
        } catch (error) {
            console.error('Error fetching retreats:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (retreatId, retreatTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${retreatTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('offerings')
                .delete()
                .eq('id', retreatId);

            if (error) throw error;

            // Refresh the list
            fetchRetreats();
        } catch (error) {
            console.error('Error deleting retreat:', error.message);
            alert('Failed to delete retreat. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDuration = (minutes) => {
        const days = Math.floor(minutes / 1440);
        const hours = Math.floor((minutes % 1440) / 60);

        if (days > 0 && hours > 0) return `${days}d ${hours}h`;
        if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'}`;
        if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
        return `${minutes} minutes`;
    };

    if (loading) {
        return (
            <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">⏳</div>
                <h2 className="dashboard-empty-title">Loading retreats...</h2>
            </div>
        );
    }

    return (
        <div>
            <div className="dashboard-page-header">
                <h1 className="dashboard-page-title">My Retreats</h1>
                <p className="dashboard-page-subtitle">
                    {retreats.length} {retreats.length === 1 ? 'retreat' : 'retreats'} created
                </p>
                <div className="dashboard-page-actions">
                    <Link
                        to="/dashboard/create-retreat"
                        className="dashboard-button dashboard-button-primary"
                    >
                        + Create New Retreat
                    </Link>
                </div>
            </div>

            {retreats.length === 0 ? (
                <div className="dashboard-empty-state">
                    <div className="dashboard-empty-icon">🌄</div>
                    <h2 className="dashboard-empty-title">No retreats yet</h2>
                    <p className="dashboard-empty-message">
                        Create your first retreat to offer transformative experiences for deep connection and renewal.
                    </p>
                    <Link
                        to="/dashboard/create-retreat"
                        className="dashboard-button dashboard-button-primary"
                    >
                        Create Your First Retreat
                    </Link>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {retreats.map((retreat) => (
                        <div key={retreat.id} className="dashboard-card">
                            {retreat.image_url && (
                                <img
                                    src={retreat.image_url}
                                    alt={retreat.title}
                                    style={{
                                        width: '100%',
                                        height: '180px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        marginBottom: '16px'
                                    }}
                                />
                            )}
                            <div className="dashboard-card-header">
                                <h3 className="dashboard-card-title">{retreat.title}</h3>
                                <div className="dashboard-card-meta">
                                    <span className="dashboard-card-meta-item">
                                        📅 {formatDate(retreat.date)}
                                    </span>
                                    <span className="dashboard-card-meta-item">
                                        ⏱️ {formatDuration(retreat.duration_minutes)}
                                    </span>
                                    {retreat.location && (
                                        <span className="dashboard-card-meta-item">
                                            📍 {retreat.location}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {retreat.description && (
                                <div className="dashboard-card-body">
                                    {retreat.description.length > 150
                                        ? `${retreat.description.substring(0, 150)}...`
                                        : retreat.description}
                                </div>
                            )}

                            <div className="dashboard-card-footer">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '20px',
                                        fontWeight: '500',
                                        color: 'var(--color-primary)'
                                    }}>
                                        ${retreat.price}
                                    </span>
                                    <span className={`dashboard-badge dashboard-badge-${retreat.status}`}>
                                        {retreat.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    {retreat.max_participants && (
                                        <span>👥 Max: {retreat.max_participants}</span>
                                    )}
                                </div>
                            </div>

                            <div className="dashboard-card-actions">
                                <Link
                                    to={`/dashboard/edit-retreat/${retreat.id}`}
                                    className="dashboard-button dashboard-button-secondary dashboard-button-small"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(retreat.id, retreat.title)}
                                    className="dashboard-button dashboard-button-danger dashboard-button-small"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RetreatList;
