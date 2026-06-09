import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const TYPE_CONFIG = {
  workshop: {
    label: 'Workshop',
    labelPlural: 'Workshops',
    icon: '🧘',
    emptyMessage: 'Create your first workshop to start sharing your knowledge and skills with others.',
    createRoute: '/dashboard/create-workshop',
    editPrefix: '/dashboard/edit-workshop',
  },
  event: {
    label: 'Event',
    labelPlural: 'Events',
    icon: '🎉',
    emptyMessage: 'Create your first event to bring your community together for meaningful experiences.',
    createRoute: '/dashboard/create-event',
    editPrefix: '/dashboard/edit-event',
  },
  retreat: {
    label: 'Retreat',
    labelPlural: 'Retreats',
    icon: '🌄',
    emptyMessage: 'Create your first retreat for a transformative experience.',
    createRoute: '/dashboard/create-retreat',
    editPrefix: '/dashboard/edit-retreat',
  },
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

const OfferingList = ({ type }) => {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const config = TYPE_CONFIG[type];

  useEffect(() => {
    fetchOfferings();
  }, [user]);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offerings')
        .select('*')
        .eq('instructor_id', user.id)
        .eq('type', type)
        .order('date', { ascending: false });

      if (error) throw error;
      setOfferings(data || []);
    } catch (error) {
      console.error(`Error fetching ${type}s:`, error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('offerings').delete().eq('id', id);
      if (error) throw error;
      fetchOfferings();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error.message);
      alert(`Failed to delete ${type}. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-empty-state">
        <div className="dashboard-empty-icon">⏳</div>
        <h2 className="dashboard-empty-title">Loading {config.labelPlural.toLowerCase()}...</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">My {config.labelPlural}</h1>
        <p className="dashboard-page-subtitle">
          {offerings.length} {offerings.length === 1 ? config.label.toLowerCase() : config.labelPlural.toLowerCase()} created
        </p>
        <div className="dashboard-page-actions">
          <Link to={config.createRoute} className="dashboard-button dashboard-button-primary">
            + Create New {config.label}
          </Link>
        </div>
      </div>

      {offerings.length === 0 ? (
        <div className="dashboard-empty-state">
          <div className="dashboard-empty-icon">{config.icon}</div>
          <h2 className="dashboard-empty-title">No {config.labelPlural.toLowerCase()} yet</h2>
          <p className="dashboard-empty-message">{config.emptyMessage}</p>
          <Link to={config.createRoute} className="dashboard-button dashboard-button-primary">
            Create Your First {config.label}
          </Link>
        </div>
      ) : (
        <div className="dashboard-grid">
          {offerings.map((offering) => (
            <div key={offering.id} className="dashboard-card">
              {offering.image_url && (
                <img
                  src={offering.image_url}
                  alt={offering.title}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px', marginBottom: '16px' }}
                />
              )}
              <div className="dashboard-card-header">
                <h3 className="dashboard-card-title">{offering.title}</h3>
                <div className="dashboard-card-meta">
                  <span className="dashboard-card-meta-item">📅 {formatDate(offering.date)}</span>
                  <span className="dashboard-card-meta-item">⏱️ {formatDuration(offering.duration_minutes)}</span>
                  {offering.location && (
                    <span className="dashboard-card-meta-item">📍 {offering.location}</span>
                  )}
                </div>
              </div>

              {offering.description && (
                <div className="dashboard-card-body">
                  {offering.description.length > 150
                    ? `${offering.description.substring(0, 150)}...`
                    : offering.description}
                </div>
              )}

              <div className="dashboard-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: '500', color: 'var(--color-primary)' }}>
                    ₹{offering.price}
                  </span>
                  <span className={`dashboard-badge dashboard-badge-${offering.status}`}>
                    {offering.status}
                  </span>
                </div>
                {offering.max_participants && (
                  <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    👥 Max: {offering.max_participants}
                  </div>
                )}
              </div>

              <div className="dashboard-card-actions">
                <Link
                  to={`${config.editPrefix}/${offering.id}`}
                  className="dashboard-button dashboard-button-secondary dashboard-button-small"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(offering.id, offering.title)}
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

export default OfferingList;
