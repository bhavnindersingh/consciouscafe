import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const WorkshopList = () => {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchWorkshops();
    }, [user]);

    const fetchWorkshops = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('offerings')
                .select('*')
                .eq('instructor_id', user.id)
                .eq('type', 'workshop')
                .order('date', { ascending: false });

            if (error) throw error;
            setWorkshops(data || []);
        } catch (error) {
            console.error('Error fetching workshops:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (workshopId, workshopTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${workshopTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('offerings')
                .delete()
                .eq('id', workshopId);

            if (error) throw error;

            // Refresh the list
            fetchWorkshops();
        } catch (error) {
            console.error('Error deleting workshop:', error.message);
            alert('Failed to delete workshop. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    if (loading) {
        return (
            <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">⏳</div>
                <h2 className="dashboard-empty-title">Loading workshops...</h2>
            </div>
        );
    }

    return (
        <div>
            <div className="dashboard-page-header">
                <h1 className="dashboard-page-title">My Workshops</h1>
                <p className="dashboard-page-subtitle">
                    {workshops.length} {workshops.length === 1 ? 'workshop' : 'workshops'} created
                </p>
                <div className="dashboard-page-actions">
                    <Link
                        to="/dashboard/create-workshop"
                        className="dashboard-button dashboard-button-primary"
                    >
                        + Create New Workshop
                    </Link>
                </div>
            </div>

            {workshops.length === 0 ? (
                <div className="dashboard-empty-state">
                    <div className="dashboard-empty-icon">🧘</div>
                    <h2 className="dashboard-empty-title">No workshops yet</h2>
                    <p className="dashboard-empty-message">
                        Create your first workshop to start sharing your knowledge and skills with others.
                    </p>
                    <Link
                        to="/dashboard/create-workshop"
                        className="dashboard-button dashboard-button-primary"
                    >
                        Create Your First Workshop
                    </Link>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {workshops.map((workshop) => (
                        <div key={workshop.id} className="dashboard-card">
                            {workshop.image_url && (
                                <img
                                    src={workshop.image_url}
                                    alt={workshop.title}
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
                                <h3 className="dashboard-card-title">{workshop.title}</h3>
                                <div className="dashboard-card-meta">
                                    <span className="dashboard-card-meta-item">
                                        📅 {formatDate(workshop.date)}
                                    </span>
                                    <span className="dashboard-card-meta-item">
                                        ⏱️ {formatDuration(workshop.duration_minutes)}
                                    </span>
                                    {workshop.location && (
                                        <span className="dashboard-card-meta-item">
                                            📍 {workshop.location}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {workshop.description && (
                                <div className="dashboard-card-body">
                                    {workshop.description.length > 150
                                        ? `${workshop.description.substring(0, 150)}...`
                                        : workshop.description}
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
                                        ${workshop.price}
                                    </span>
                                    <span className={`dashboard-badge dashboard-badge-${workshop.status}`}>
                                        {workshop.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    {workshop.max_participants && (
                                        <span>👥 Max: {workshop.max_participants}</span>
                                    )}
                                </div>
                            </div>

                            <div className="dashboard-card-actions">
                                <Link
                                    to={`/dashboard/edit-workshop/${workshop.id}`}
                                    className="dashboard-button dashboard-button-secondary dashboard-button-small"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(workshop.id, workshop.title)}
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

export default WorkshopList;
