import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const EventManager = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        duration_minutes: 120,
        price: 0,
        image_url: '',
        location: '',
        max_participants: '',
        status: 'published'
    });

    useEffect(() => {
        if (isEditMode && id) {
            fetchEvent();
        }
    }, [id, isEditMode]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('offerings')
                .select('*')
                .eq('id', id)
                .eq('instructor_id', user.id)
                .single();

            if (error) throw error;

            const formattedDate = new Date(data.date).toISOString().slice(0, 16);

            setFormData({
                title: data.title || '',
                description: data.description || '',
                date: formattedDate,
                duration_minutes: data.duration_minutes || 120,
                price: data.price || 0,
                image_url: data.image_url || '',
                location: data.location || '',
                max_participants: data.max_participants || '',
                status: data.status || 'published'
            });
        } catch (err) {
            setError(err.message || 'Error loading event');
            console.error('Error fetching event:', err);
        } finally {
            setLoading(false);
        }
    };

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
            const eventData = {
                ...formData,
                type: 'event',
                instructor_id: user.id,
                date: new Date(formData.date).toISOString(),
                max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
            };

            if (isEditMode) {
                const { error: updateError } = await supabase
                    .from('offerings')
                    .update(eventData)
                    .eq('id', id)
                    .eq('instructor_id', user.id);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('offerings')
                    .insert([eventData]);

                if (insertError) throw insertError;
            }

            navigate('/dashboard/events');
        } catch (err) {
            setError(err.message || `Error ${isEditMode ? 'updating' : 'creating'} event`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="dashboard-page-header">
                <h1 className="dashboard-page-title">
                    {isEditMode ? 'Edit Event' : 'Create New Event'}
                </h1>
                <p className="dashboard-page-subtitle">
                    {isEditMode
                        ? 'Update your event details'
                        : 'Host a memorable event that brings your community together'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="dashboard-form">
                {error && (
                    <div className="dashboard-alert dashboard-alert-error">
                        {error}
                    </div>
                )}

                <div className="dashboard-form-group">
                    <label htmlFor="title" className="dashboard-label">
                        Event Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        required
                        className="dashboard-input"
                        placeholder="e.g., Full Moon Gathering & Sound Bath"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    <div className="dashboard-input-hint">
                        Make it exciting and descriptive to attract attendees
                    </div>
                </div>

                <div className="dashboard-form-group">
                    <label htmlFor="description" className="dashboard-label">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={5}
                        className="dashboard-textarea"
                        placeholder="Describe what attendees can expect from this event..."
                        value={formData.description}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="dashboard-form-row">
                    <div className="dashboard-form-group">
                        <label htmlFor="date" className="dashboard-label">
                            Date & Time
                        </label>
                        <input
                            id="date"
                            type="datetime-local"
                            name="date"
                            required
                            className="dashboard-input"
                            value={formData.date}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="dashboard-form-group">
                        <label htmlFor="duration_minutes" className="dashboard-label">
                            Duration (minutes)
                        </label>
                        <input
                            id="duration_minutes"
                            type="number"
                            name="duration_minutes"
                            required
                            min="15"
                            step="15"
                            className="dashboard-input"
                            value={formData.duration_minutes}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="dashboard-form-row">
                    <div className="dashboard-form-group">
                        <label htmlFor="price" className="dashboard-label">
                            Price ($)
                        </label>
                        <input
                            id="price"
                            type="number"
                            name="price"
                            min="0"
                            step="0.01"
                            className="dashboard-input"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <div className="dashboard-input-hint">Set to 0 for free events</div>
                    </div>

                    <div className="dashboard-form-group">
                        <label htmlFor="max_participants" className="dashboard-label">
                            Max Attendees <span className="dashboard-label-optional">(optional)</span>
                        </label>
                        <input
                            id="max_participants"
                            type="number"
                            name="max_participants"
                            min="1"
                            className="dashboard-input"
                            placeholder="Unlimited"
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
                        id="location"
                        type="text"
                        name="location"
                        className="dashboard-input"
                        placeholder="e.g., Conscious Cafe or Virtual Event"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="dashboard-form-group">
                    <label htmlFor="image_url" className="dashboard-label">
                        Event Image URL <span className="dashboard-label-optional">(optional)</span>
                    </label>
                    <input
                        id="image_url"
                        type="url"
                        name="image_url"
                        className="dashboard-input"
                        placeholder="https://example.com/image.jpg"
                        value={formData.image_url}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    <div className="dashboard-input-hint">Add a featured image to make your event stand out</div>
                </div>

                <div className="dashboard-form-group">
                    <label htmlFor="status" className="dashboard-label">
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
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
                        onClick={() => navigate('/dashboard/events')}
                        className="dashboard-button dashboard-button-secondary"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="dashboard-button dashboard-button-primary"
                    >
                        {loading
                            ? (isEditMode ? 'Updating Event...' : 'Creating Event...')
                            : (isEditMode ? 'Update Event' : 'Create Event')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventManager;
