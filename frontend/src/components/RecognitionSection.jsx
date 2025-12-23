import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

function RecognitionSection({ profileId, recognition, onRecognitionAdded, isVerified }) {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'know_personally',
        relationship: '',
        notes: ''
    });

    const levelColors = {
        new: '#9CA3AF',
        low: '#F59E0B',
        moderate: '#10B981',
        high: '#059669'
    };

    const recognitionTypes = [
        { value: 'know_personally', label: 'I know them personally' },
        { value: 'know_family', label: 'I know their family' },
        { value: 'verified_documents', label: 'I verified their documents' },
        { value: 'community_reference', label: 'Community reference' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post(`/profiles/${profileId}/recognitions`, formData);
            toast.success('Recognition added successfully!');
            setShowForm(false);
            setFormData({ type: 'know_personally', relationship: '', notes: '' });
            if (onRecognitionAdded) onRecognitionAdded();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add recognition');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ marginTop: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Recognition Score</h3>

            <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
                <div>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: levelColors[recognition?.level || 'new']
                    }}>
                        {recognition?.score?.toFixed(1) || '0.0'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '14px' }}>
                        {recognition?.level || 'NEW'}
                    </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '32px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                        {recognition?.recogniserCount || 0}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        People Recognise
                    </div>
                </div>
            </div>

            {!isVerified ? (
                <p style={{ color: 'var(--text-muted)', padding: '16px', background: 'var(--background)', borderRadius: '8px' }}>
                    ⚠️ Only verified users can add recognition. Contact an admin to get verified.
                </p>
            ) : !showForm ? (
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    🤝 I Know This Person
                </button>
            ) : (
                <form onSubmit={handleSubmit} style={{ background: 'var(--background)', padding: '24px', borderRadius: '12px' }}>
                    <h4 style={{ marginBottom: '16px' }}>Add Your Recognition</h4>

                    <div className="form-group">
                        <label>How do you know them?</label>
                        {recognitionTypes.map(type => (
                            <label key={type.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="type"
                                    value={type.value}
                                    checked={formData.type === type.value}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    style={{ width: 'auto' }}
                                />
                                {type.label}
                            </label>
                        ))}
                    </div>

                    <div className="form-group">
                        <label>Relationship (optional)</label>
                        <input
                            type="text"
                            placeholder="e.g., Family friend, Neighbor, Colleague"
                            value={formData.relationship}
                            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Notes (optional)</label>
                        <textarea
                            placeholder="Any additional details about how you know them..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        ⚠️ Your name will be recorded with this recognition.
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Recognition'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default RecognitionSection;
