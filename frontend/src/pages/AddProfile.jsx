import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function AddProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        gender: 'male',
        dateOfBirth: '',
        phone: '',
        email: '',
        caste: '',
        subCaste: '',
        gotra: '',
        city: '',
        state: '',
        education: '',
        profession: '',
        company: '',
        annualIncome: '',
        heightCm: '',
        maritalStatus: 'never_married',
        fatherName: '',
        fatherOccupation: '',
        motherName: '',
        siblings: '',
        familyType: 'nuclear'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Clean up empty fields and convert heightCm to number
            const data = { ...formData };
            if (data.heightCm) data.heightCm = parseInt(data.heightCm);
            else delete data.heightCm;

            Object.keys(data).forEach(key => {
                if (data[key] === '') delete data[key];
            });

            const response = await api.post('/profiles', data);
            toast.success('Profile created successfully!');
            navigate(`/profiles/${response.data.data.profile._id}`);
        } catch (error) {
            toast.error(error.response?.data?.error || error.response?.data?.details?.[0] || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <h1 style={{ marginBottom: '32px' }}>Add New Profile</h1>

            <form onSubmit={handleSubmit} className="card">
                {/* Basic Info */}
                <h3 style={{ marginBottom: '24px' }}>Basic Information</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name *</label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Gender *</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dateOfBirth">Date of Birth *</label>
                        <input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

                {/* Demographics */}
                <h3 style={{ marginBottom: '24px' }}>Demographics</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="caste">Caste *</label>
                        <input
                            id="caste"
                            name="caste"
                            type="text"
                            value={formData.caste}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="subCaste">Sub-Caste</label>
                        <input
                            id="subCaste"
                            name="subCaste"
                            type="text"
                            value={formData.subCaste}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gotra">Gotra</label>
                        <input
                            id="gotra"
                            name="gotra"
                            type="text"
                            value={formData.gotra}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="city">City *</label>
                        <input
                            id="city"
                            name="city"
                            type="text"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="state">State *</label>
                        <input
                            id="state"
                            name="state"
                            type="text"
                            value={formData.state}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

                {/* Education & Career */}
                <h3 style={{ marginBottom: '24px' }}>Education & Career</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="education">Education *</label>
                        <input
                            id="education"
                            name="education"
                            type="text"
                            placeholder="e.g., B.Tech, MBA, MBBS"
                            value={formData.education}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="profession">Profession *</label>
                        <input
                            id="profession"
                            name="profession"
                            type="text"
                            placeholder="e.g., Software Engineer, Doctor"
                            value={formData.profession}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="company">Company</label>
                        <input
                            id="company"
                            name="company"
                            type="text"
                            value={formData.company}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="annualIncome">Annual Income</label>
                        <input
                            id="annualIncome"
                            name="annualIncome"
                            type="text"
                            placeholder="e.g., 5-10 LPA"
                            value={formData.annualIncome}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

                {/* Physical & Marital */}
                <h3 style={{ marginBottom: '24px' }}>Other Details</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="heightCm">Height (cm)</label>
                        <input
                            id="heightCm"
                            name="heightCm"
                            type="number"
                            min="100"
                            max="250"
                            value={formData.heightCm}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="maritalStatus">Marital Status</label>
                        <select id="maritalStatus" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                            <option value="never_married">Never Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                            <option value="awaiting_divorce">Awaiting Divorce</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="familyType">Family Type</label>
                        <select id="familyType" name="familyType" value={formData.familyType} onChange={handleChange}>
                            <option value="nuclear">Nuclear</option>
                            <option value="joint">Joint</option>
                        </select>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

                {/* Family */}
                <h3 style={{ marginBottom: '24px' }}>Family Details</h3>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="fatherName">Father's Name</label>
                        <input
                            id="fatherName"
                            name="fatherName"
                            type="text"
                            value={formData.fatherName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fatherOccupation">Father's Occupation</label>
                        <input
                            id="fatherOccupation"
                            name="fatherOccupation"
                            type="text"
                            value={formData.fatherOccupation}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="motherName">Mother's Name</label>
                        <input
                            id="motherName"
                            name="motherName"
                            type="text"
                            value={formData.motherName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="siblings">Siblings</label>
                        <input
                            id="siblings"
                            name="siblings"
                            type="text"
                            placeholder="e.g., 2 brothers, 1 sister"
                            value={formData.siblings}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Profile'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/profiles')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddProfile;
