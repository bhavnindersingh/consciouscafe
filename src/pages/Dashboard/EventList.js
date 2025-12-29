import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchEvents();
    }, [user]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('offerings')
                .select('*')
                .eq('instructor_id', user.id)
                .eq('type', 'event')
                .order('date', { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId, eventTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('offerings')
                .delete()
                .eq('id', eventId);

            if (error) throw error;

            // Refresh the list
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error.message);
            alert('Failed to delete event. Please try again.');
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
                <h2 className="dashboard-empty-title">Loading events...</h2>
            </div>
        );
    }

    return (
        <div>
            <div className="dashboard-page-header">
                <h1 className="dashboard-page-title">My Events</h1>
                <p className="dashboard-page-subtitle">
                    {events.length} {events.length === 1 ? 'event' : 'events'} created
                </p>
                <div className="dashboard-page-actions">
                    <Link
                        to="/dashboard/create-event"
                        className="dashboard-button dashboard-button-primary"
                    >
                        + Create New Event
                    </Link>
                </div>
            </div>

            {events.length === 0 ? (
                <div className="dashboard-empty-state">
                    <div className="dashboard-empty-icon">🎉</div>
                    <h2 className="dashboard-empty-title">No events yet</h2>
                    <p className="dashboard-empty-message">
                        Create your first event to bring your community together for meaningful experiences.
                    </p>
                    <Link
                        to="/dashboard/create-event"
                        className="dashboard-button dashboard-button-primary"
                    >
                        Create Your First Event
                    </Link>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {events.map((event) => (
                        <div key={event.id} className="dashboard-card">
                            {event.image_url && (
                                <img
                                    src={event.image_url}
                                    alt={event.title}
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
                                <h3 className="dashboard-card-title">{event.title}</h3>
                                <div className="dashboard-card-meta">
                                    <span className="dashboard-card-meta-item">
                                        📅 {formatDate(event.date)}
                                    </span>
                                    <span className="dashboard-card-meta-item">
                                        ⏱️ {formatDuration(event.duration_minutes)}
                                    </span>
                                    {event.location && (
                                        <span className="dashboard-card-meta-item">
                                            📍 {event.location}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {event.description && (
                                <div className="dashboard-card-body">
                                    {event.description.length > 150
                                        ? `${event.description.substring(0, 150)}...`
                                        : event.description}
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
                                        ${event.price}
                                    </span>
                                    <span className={`dashboard-badge dashboard-badge-${event.status}`}>
                                        {event.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    {event.max_participants && (
                                        <span>👥 Max: {event.max_participants}</span>
                                    )}
                                </div>
                            </div>

                            <div className="dashboard-card-actions">
                                <Link
                                    to={`/dashboard/edit-event/${event.id}`}
                                    className="dashboard-button dashboard-button-secondary dashboard-button-small"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(event.id, event.title)}
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

export default EventList;
