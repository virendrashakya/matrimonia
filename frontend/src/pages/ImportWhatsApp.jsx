import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function ImportWhatsApp() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [importResult, setImportResult] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const validExtensions = ['.txt', '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
        const isValid = validExtensions.some(ext => selectedFile?.name.toLowerCase().endsWith(ext));

        if (selectedFile && isValid) {
            setFile(selectedFile);
            setPreview(null);
            setImportResult(null);

            if (!selectedFile.name.endsWith('.txt')) {
                toast('PDF/DOC/Image parsing requires AI integration (coming soon)', { icon: 'ℹ️' });
            }
        } else {
            toast.error('Please select a supported file format');
        }
    };

    const handlePreview = async () => {
        if (!file) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/import/whatsapp?preview=true', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setPreview(response.data.data);
            toast.success(`Found ${response.data.data.count} biodata entries`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to parse file');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/import/whatsapp', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setImportResult(response.data.data);
            toast.success(`Imported ${response.data.data.imported} profiles!`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <h1 style={{ marginBottom: '8px' }}>Import from WhatsApp</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                Upload a WhatsApp group chat export (.txt) to import matrimonial profiles
            </p>

            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Step 1: Export WhatsApp Chat</h3>
                <ol style={{ paddingLeft: '24px', color: 'var(--text-secondary)', lineHeight: '2' }}>
                    <li>Open your WhatsApp matrimonial group</li>
                    <li>Tap the group name → More → Export chat</li>
                    <li>Choose "Without media" for faster export</li>
                    <li>Save the .txt file to your device</li>
                </ol>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Step 2: Upload File</h3>

                <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <input
                        type="file"
                        accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        id="file-upload"
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📄</div>
                        <p style={{ margin: 0, color: 'var(--primary)', fontWeight: '600' }}>
                            {file ? file.name : 'Click to select file'}
                        </p>
                        <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                            Supported: .txt (WhatsApp), .pdf, .doc, images
                        </p>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--risk-medium)', fontSize: '12px' }}>
                            Note: PDF/DOC/images require AI (coming soon)
                        </p>
                    </label>
                </div>

                {file && !preview && !importResult && (
                    <button
                        onClick={handlePreview}
                        className="btn btn-secondary"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? 'Parsing...' : '🔍 Preview Extracted Data'}
                    </button>
                )}
            </div>

            {/* Preview Results */}
            {preview && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>
                        Step 3: Review ({preview.count} profiles found)
                    </h3>

                    <div style={{ maxHeight: '400px', overflow: 'auto', marginBottom: '24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px', background: 'var(--background)' }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '12px', background: 'var(--background)' }}>Gender</th>
                                    <th style={{ textAlign: 'left', padding: '12px', background: 'var(--background)' }}>Caste</th>
                                    <th style={{ textAlign: 'left', padding: '12px', background: 'var(--background)' }}>City</th>
                                    <th style={{ textAlign: 'left', padding: '12px', background: 'var(--background)' }}>Education</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.preview.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>{item.fullName || 'Unknown'}</td>
                                        <td style={{ padding: '12px' }}>{item.gender || '-'}</td>
                                        <td style={{ padding: '12px' }}>{item.caste || '-'}</td>
                                        <td style={{ padding: '12px' }}>{item.city || '-'}</td>
                                        <td style={{ padding: '12px' }}>{item.education || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {preview.count > 10 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
                                Showing first 10 of {preview.count} entries
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={handleImport}
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Importing...' : `✓ Import ${preview.count} Profiles`}
                        </button>
                        <button
                            onClick={() => { setFile(null); setPreview(null); }}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Import Results */}
            {importResult && (
                <div className="card">
                    <h3 style={{ marginBottom: '16px', color: 'var(--risk-low)' }}>
                        ✓ Import Complete
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ textAlign: 'center', padding: '16px', background: 'var(--background)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{importResult.total}</div>
                            <div style={{ color: 'var(--text-muted)' }}>Total Found</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', background: '#D1FAE5', borderRadius: '8px' }}>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--risk-low)' }}>{importResult.imported}</div>
                            <div style={{ color: 'var(--text-muted)' }}>Imported</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '16px', background: '#FEF3C7', borderRadius: '8px' }}>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--risk-medium)' }}>{importResult.skipped}</div>
                            <div style={{ color: 'var(--text-muted)' }}>Skipped</div>
                        </div>
                    </div>

                    {importResult.errors.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ marginBottom: '8px' }}>Skipped Entries:</h4>
                            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)' }}>
                                {importResult.errors.map((err, i) => (
                                    <li key={i}>{err.name}: {err.reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button onClick={() => navigate('/profiles')} className="btn btn-primary">
                        View Imported Profiles
                    </button>
                </div>
            )}
        </div>
    );
}

export default ImportWhatsApp;
