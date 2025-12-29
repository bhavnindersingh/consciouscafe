import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const RetreatManager = () => {
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
        duration_minutes: 2880, // 2 days default
        price: 0,
        image_url: '',
        location: '',
        max_participants: '',
        status: 'published'
    });

    useEffect(() => {
        if (isEditMode && id) {
            fetchRetreat();
        }
    }, [id, isEditMode]);

    const fetchRetreat = async () => {
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
                duration_minutes: data.duration_minutes || 2880,
                price: data.price || 0,
                image_url: data.image_url || '',
                location: data.location || '',
                max_participants: data.max_participants || '',
                status: data.status || 'published'
            });
        } catch (err) {
            setError(err.message || 'Error loading retreat');
            console.error('Error fetching retreat:', err);
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
            const retreatData = {
                ...formData,
                type: 'retreat',
                instructor_id: user.id,
                date: new Date(formData.date).toISOString(),
                max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
            };

            if (isEditMode) {
                const { error: updateError } = await supabase
                    .from('offerings')
                    .update(retreatData)
                    .eq('id', id)
                    .eq('instructor_id', user.id);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('offerings')
                    .insert([retreatData]);

                if (insertError) throw insertError;
            }

            navigate('/dashboard/retreats');
        } catch (err) {
            setError(err.message || `Error ${isEditMode ? 'updating' : 'creating'} retreat`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="dashboard-page-header">
                <h1 className="dashboard-page-title">
                    {isEditMode ? 'Edit Retreat' : 'Create New Retreat'}
                </h1>
                <p className="dashboard-page-subtitle">
                    {isEditMode
                        ? 'Update your retreat details'
                        : 'Create a transformative retreat experience for deep connection and renewal'}
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
                        Retreat Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        required
                        className="dashboard-input"
                        placeholder="e.g., Weekend Wellness Retreat in the Mountains"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    <div className="dashboard-input-hint">
                        Create an inspiring title that captures the essence of your retreat
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
                        placeholder="Describe the retreat experience, activities, what's included, and what participants will gain..."
                        value={formData.description}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="dashboard-form-row">
                    <div className="dashboard-form-group">
                        <label htmlFor="date" className="dashboard-label">
                            Start Date & Time
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
                            min="60"
                            step="60"
                            className="dashboard-input"
                            value={formData.duration_minutes}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <div className="dashboard-input-hint">
                            e.g., 1440 = 1 day, 2880 = 2 days, 4320 = 3 days
                        </div>
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
                        <div className="dashboard-input-hint">Total retreat price per person</div>
                    </div>

                    <div className="dashboard-form-group">
                        <label htmlFor="max_participants" className="dashboard-label">
                            Max Participants <span className="dashboard-label-optional">(optional)</span>
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
                        placeholder="e.g., Mountain Retreat Center, Bali"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    <div className="dashboard-input-hint">
                        Include the retreat venue or destination
                    </div>
                </div>

                <div className="dashboard-form-group">
                    <label htmlFor="image_url" className="dashboard-label">
                        Retreat Image URL <span className="dashboard-label-optional">(optional)</span>
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
                    <div className="dashboard-input-hint">Use a beautiful, inspiring image of the retreat location</div>
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
                        onClick={() => navigate('/dashboard/retreats')}
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
                            ? (isEditMode ? 'Updating Retreat...' : 'Creating Retreat...')
                            : (isEditMode ? 'Update Retreat' : 'Create Retreat')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RetreatManager;
