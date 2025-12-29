import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const DashboardHome = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        workshops: 0,
        events: 0,
        retreats: 0,
        pendingRsvps: 0
    });
    const [recentRsvps, setRecentRsvps] = useState([]);
    const [upcomingOfferings, setUpcomingOfferings] = useState([]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch offerings counts
            const { data: offerings, error: offeringsError } = await supabase
                .from('offerings')
                .select('type, status')
                .eq('instructor_id', user.id);

            if (offeringsError) throw offeringsError;

            // Calculate stats
            const workshopsCount = offerings.filter(o => o.type === 'workshop').length;
            const eventsCount = offerings.filter(o => o.type === 'event').length;
            const retreatsCount = offerings.filter(o => o.type === 'retreat').length;

            // Fetch pending RSVPs count
            const { data: allRsvps, error: rsvpsError } = await supabase
                .from('rsvps')
                .select(`
                    *,
                    offerings:offering_id (
                        id,
                        instructor_id
                    )
                `)
                .eq('status', 'pending');

            if (rsvpsError) throw rsvpsError;

            const pendingCount = allRsvps.filter(
                rsvp => rsvp.offerings && rsvp.offerings.instructor_id === user.id
            ).length;

            setStats({
                workshops: workshopsCount,
                events: eventsCount,
                retreats: retreatsCount,
                pendingRsvps: pendingCount
            });

            // Fetch recent RSVPs (last 5)
            const { data: recentRsvpsData, error: recentRsvpsError } = await supabase
                .from('rsvps')
                .select(`
                    *,
                    offerings:offering_id (
                        id,
                        title,
                        type,
                        instructor_id
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(20);

            if (recentRsvpsError) throw recentRsvpsError;

            const filteredRecentRsvps = recentRsvpsData
                .filter(rsvp => rsvp.offerings && rsvp.offerings.instructor_id === user.id)
                .slice(0, 5);

            setRecentRsvps(filteredRecentRsvps);

            // Fetch upcoming offerings (next 5)
            const { data: upcomingData, error: upcomingError } = await supabase
                .from('offerings')
                .select('*')
                .eq('instructor_id', user.id)
                .eq('status', 'published')
                .gte('date', new Date().toISOString())
                .order('date', { ascending: true })
                .limit(5);

            if (upcomingError) throw upcomingError;

            // Get RSVP counts for upcoming offerings
            const offeringsWithRsvps = await Promise.all(
                upcomingData.map(async (offering) => {
                    const { count, error } = await supabase
                        .from('rsvps')
                        .select('*', { count: 'exact', head: true })
                        .eq('offering_id', offering.id)
                        .eq('status', 'approved');

                    return {
                        ...offering,
                        rsvpCount: error ? 0 : count
                    };
                })
            );

            setUpcomingOfferings(offeringsWithRsvps);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
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

    const getOfferingIcon = (type) => {
        const icons = {
            'workshop': '🧘',
            'event': '🎉',
            'retreat': '🌄'
        };
        return icons[type] || '📅';
    };

    if (loading) {
        return (
            <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">⏳</div>
                <h2 className="dashboard-empty-title">Loading Dashboard...</h2>
            </div>
        );
    }

    return (
        <div className="dashboard-home">
            {/* Welcome Header */}
            <div className="dashboard-welcome">
                <h1 className="dashboard-welcome-title">
                    Welcome back, {user.email?.split('@')[0] || 'Facilitator'}
                </h1>
                <p className="dashboard-welcome-subtitle">
                    Here's an overview of your offerings and recent activity
                </p>
            </div>

            {/* Stats Cards */}
            <div className="dashboard-stats-grid">
                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon">🧘</div>
                    <div className="dashboard-stat-content">
                        <div className="dashboard-stat-value">{stats.workshops}</div>
                        <div className="dashboard-stat-label">Workshops</div>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon">🎉</div>
                    <div className="dashboard-stat-content">
                        <div className="dashboard-stat-value">{stats.events}</div>
                        <div className="dashboard-stat-label">Events</div>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-icon">🌄</div>
                    <div className="dashboard-stat-content">
                        <div className="dashboard-stat-value">{stats.retreats}</div>
                        <div className="dashboard-stat-label">Retreats</div>
                    </div>
                </div>

                <div className="dashboard-stat-card dashboard-stat-card-highlight">
                    <div className="dashboard-stat-icon">✉️</div>
                    <div className="dashboard-stat-content">
                        <div className="dashboard-stat-value">{stats.pendingRsvps}</div>
                        <div className="dashboard-stat-label">Pending RSVPs</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h2 className="dashboard-section-title">Quick Actions</h2>
                <div className="dashboard-quick-actions">
                    <Link to="/dashboard/create-workshop" className="dashboard-action-card">
                        <div className="dashboard-action-icon">🧘</div>
                        <div className="dashboard-action-label">Create Workshop</div>
                    </Link>
                    <Link to="/dashboard/create-event" className="dashboard-action-card">
                        <div className="dashboard-action-icon">🎉</div>
                        <div className="dashboard-action-label">Create Event</div>
                    </Link>
                    <Link to="/dashboard/create-retreat" className="dashboard-action-card">
                        <div className="dashboard-action-icon">🌄</div>
                        <div className="dashboard-action-label">Create Retreat</div>
                    </Link>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="dashboard-two-column">
                {/* Recent RSVPs */}
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2 className="dashboard-section-title">Recent RSVPs</h2>
                        <Link to="/dashboard/rsvps" className="dashboard-view-all">View All →</Link>
                    </div>

                    {recentRsvps.length === 0 ? (
                        <div className="dashboard-empty-state-small">
                            <p>No recent RSVPs</p>
                        </div>
                    ) : (
                        <div className="dashboard-rsvp-list">
                            {recentRsvps.map((rsvp) => (
                                <div key={rsvp.id} className="dashboard-rsvp-item">
                                    <div className="dashboard-rsvp-main">
                                        <div className="dashboard-rsvp-offering">
                                            <span className="dashboard-rsvp-icon">
                                                {getOfferingIcon(rsvp.offerings?.type)}
                                            </span>
                                            <span className="dashboard-rsvp-title">
                                                {rsvp.offerings?.title || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="dashboard-rsvp-guest">{rsvp.user_name}</div>
                                    </div>
                                    <span className={getStatusBadgeClass(rsvp.status)}>
                                        {rsvp.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Offerings */}
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2 className="dashboard-section-title">Upcoming Offerings</h2>
                    </div>

                    {upcomingOfferings.length === 0 ? (
                        <div className="dashboard-empty-state-small">
                            <p>No upcoming offerings</p>
                        </div>
                    ) : (
                        <div className="dashboard-offering-list">
                            {upcomingOfferings.map((offering) => (
                                <div key={offering.id} className="dashboard-offering-item">
                                    <div className="dashboard-offering-icon">
                                        {getOfferingIcon(offering.type)}
                                    </div>
                                    <div className="dashboard-offering-details">
                                        <div className="dashboard-offering-title">{offering.title}</div>
                                        <div className="dashboard-offering-meta">
                                            {formatDate(offering.date)} • {offering.rsvpCount || 0} RSVPs
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
