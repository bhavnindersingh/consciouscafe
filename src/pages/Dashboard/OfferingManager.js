import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const TYPE_CONFIG = {
  workshop: {
    label: 'Workshop',
    defaultDuration: 60,
    durationMin: 15,
    durationStep: 15,
    durationHint: null,
    dateLabel: 'Date & Time',
    titlePlaceholder: 'e.g., Mindful Meditation for Beginners',
    titleHint: 'Make it clear and descriptive to attract participants',
    descriptionPlaceholder: 'Describe what participants will learn and experience...',
    priceHint: 'Set to 0 for free workshops',
    participantsLabel: 'Max Participants',
    locationPlaceholder: 'e.g., Conscious Cafe or Online via Zoom',
    locationHint: null,
    imageHint: 'Add a featured image to make your workshop more appealing',
    createSubtitle: 'Share your knowledge and skills through an engaging workshop experience',
    listRoute: '/dashboard/workshops',
  },
  event: {
    label: 'Event',
    defaultDuration: 120,
    durationMin: 15,
    durationStep: 15,
    durationHint: null,
    dateLabel: 'Date & Time',
    titlePlaceholder: 'e.g., Full Moon Gathering & Sound Bath',
    titleHint: 'Make it exciting and descriptive to attract attendees',
    descriptionPlaceholder: 'Describe what attendees can expect from this event...',
    priceHint: 'Set to 0 for free events',
    participantsLabel: 'Max Attendees',
    locationPlaceholder: 'e.g., Conscious Cafe or Virtual Event',
    locationHint: null,
    imageHint: 'Add a featured image to make your event stand out',
    createSubtitle: 'Host a memorable event that brings your community together',
    listRoute: '/dashboard/events',
  },
  retreat: {
    label: 'Retreat',
    defaultDuration: 2880,
    durationMin: 60,
    durationStep: 60,
    durationHint: 'e.g., 1440 = 1 day, 2880 = 2 days, 4320 = 3 days',
    dateLabel: 'Start Date & Time',
    titlePlaceholder: 'e.g., Weekend Wellness Retreat in the Mountains',
    titleHint: 'Create an inspiring title that captures the essence of your retreat',
    descriptionPlaceholder: 'Describe the retreat experience, activities, what\'s included, and what participants will gain...',
    priceHint: 'Total retreat price per person',
    participantsLabel: 'Max Participants',
    locationPlaceholder: 'e.g., Mountain Retreat Center, Bali',
    locationHint: 'Include the retreat venue or destination',
    imageHint: 'Use a beautiful, inspiring image of the retreat location',
    createSubtitle: 'Create a transformative retreat experience for deep connection and renewal',
    listRoute: '/dashboard/retreats',
  },
};

const OfferingManager = ({ type }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const config = TYPE_CONFIG[type];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    duration_minutes: config.defaultDuration,
    price: 0,
    image_url: '',
    location: '',
    max_participants: '',
    status: 'published',
  });

  useEffect(() => {
    if (isEditMode && id) fetchOffering();
  }, [id, isEditMode]);

  const fetchOffering = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('offerings')
        .select('*')
        .eq('id', id)
        .eq('instructor_id', user.id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || '',
        description: data.description || '',
        date: new Date(data.date).toISOString().slice(0, 16),
        duration_minutes: data.duration_minutes || config.defaultDuration,
        price: data.price || 0,
        image_url: data.image_url || '',
        location: data.location || '',
        max_participants: data.max_participants || '',
        status: data.status || 'published',
      });
    } catch (err) {
      setError(err.message || `Error loading ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        type,
        instructor_id: user.id,
        date: new Date(formData.date).toISOString(),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      };

      if (isEditMode) {
        const { error } = await supabase.from('offerings').update(payload).eq('id', id).eq('instructor_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('offerings').insert([payload]);
        if (error) throw error;
      }

      navigate(config.listRoute);
    } catch (err) {
      setError(err.message || `Error ${isEditMode ? 'updating' : 'creating'} ${type}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="dashboard-page-header">
        <h1 className="dashboard-page-title">
          {isEditMode ? `Edit ${config.label}` : `Create New ${config.label}`}
        </h1>
        <p className="dashboard-page-subtitle">
          {isEditMode ? `Update your ${type} details` : config.createSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="dashboard-form">
        {error && <div className="dashboard-alert dashboard-alert-error">{error}</div>}

        <div className="dashboard-form-group">
          <label htmlFor="title" className="dashboard-label">{config.label} Title</label>
          <input
            id="title" type="text" name="title" required
            className="dashboard-input"
            placeholder={config.titlePlaceholder}
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
          />
          <div className="dashboard-input-hint">{config.titleHint}</div>
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="description" className="dashboard-label">Description</label>
          <textarea
            id="description" name="description" rows={5}
            className="dashboard-textarea"
            placeholder={config.descriptionPlaceholder}
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="dashboard-form-row">
          <div className="dashboard-form-group">
            <label htmlFor="date" className="dashboard-label">{config.dateLabel}</label>
            <input
              id="date" type="datetime-local" name="date" required
              className="dashboard-input"
              value={formData.date}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="dashboard-form-group">
            <label htmlFor="duration_minutes" className="dashboard-label">Duration (minutes)</label>
            <input
              id="duration_minutes" type="number" name="duration_minutes" required
              min={config.durationMin} step={config.durationStep}
              className="dashboard-input"
              value={formData.duration_minutes}
              onChange={handleChange}
              disabled={loading}
            />
            {config.durationHint && (
              <div className="dashboard-input-hint">{config.durationHint}</div>
            )}
          </div>
        </div>

        <div className="dashboard-form-row">
          <div className="dashboard-form-group">
            <label htmlFor="price" className="dashboard-label">Price (₹)</label>
            <input
              id="price" type="number" name="price" min="0" step="0.01"
              className="dashboard-input" placeholder="0.00"
              value={formData.price}
              onChange={handleChange}
              disabled={loading}
            />
            <div className="dashboard-input-hint">{config.priceHint}</div>
          </div>

          <div className="dashboard-form-group">
            <label htmlFor="max_participants" className="dashboard-label">
              {config.participantsLabel} <span className="dashboard-label-optional">(optional)</span>
            </label>
            <input
              id="max_participants" type="number" name="max_participants" min="1"
              className="dashboard-input" placeholder="Unlimited"
              value={formData.max_participants}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="location" className="dashboard-label">
            Location <span className="dashboard-label-optional">(optional)</span>
          </label>
          <input
            id="location" type="text" name="location"
            className="dashboard-input"
            placeholder={config.locationPlaceholder}
            value={formData.location}
            onChange={handleChange}
            disabled={loading}
          />
          {config.locationHint && (
            <div className="dashboard-input-hint">{config.locationHint}</div>
          )}
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="image_url" className="dashboard-label">
            Image URL <span className="dashboard-label-optional">(optional)</span>
          </label>
          <input
            id="image_url" type="url" name="image_url"
            className="dashboard-input" placeholder="https://example.com/image.jpg"
            value={formData.image_url}
            onChange={handleChange}
            disabled={loading}
          />
          <div className="dashboard-input-hint">{config.imageHint}</div>
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="status" className="dashboard-label">Status</label>
          <select
            id="status" name="status"
            className="dashboard-select"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="published">Published (visible to public)</option>
            <option value="draft">Draft (not visible)</option>
          </select>
        </div>

        <div className="dashboard-form-actions">
          <button
            type="button"
            onClick={() => navigate(config.listRoute)}
            className="dashboard-button dashboard-button-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="dashboard-button dashboard-button-primary">
            {loading
              ? (isEditMode ? `Updating ${config.label}...` : `Creating ${config.label}...`)
              : (isEditMode ? `Update ${config.label}` : `Create ${config.label}`)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferingManager;
