import React, { useState, useEffect, useRef } from 'react';
import { getFiles, uploadFile, downloadFile, deleteFile } from '../services/api';

const FILE_ICONS = {
  'image/jpeg': '🖼️', 'image/png': '🖼️', 'image/gif': '🖼️', 'image/webp': '🖼️', 'image/svg+xml': '🖼️',
  'application/pdf': '📄',
  'application/zip': '🗜️', 'application/x-zip-compressed': '🗜️', 'application/x-rar-compressed': '🗜️',
  'text/plain': '📝', 'text/html': '🌐', 'text/css': '🎨', 'text/javascript': '⚡',
  'application/json': '📋',
  'video/mp4': '🎬', 'video/webm': '🎬',
  'audio/mpeg': '🎵', 'audio/wav': '🎵',
};

const getFileIcon = (mimetype) => FILE_ICONS[mimetype] || '📁';

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Files = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef();

  const fetchFiles = async () => {
    try {
      const res = await getFiles();
      setFiles(res.data.files || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const showMessage = (type, msg) => {
    if (type === 'error') setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 10 : prev));
      }, 150);

      const res = await uploadFile(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setFiles((prev) => [res.data.file, ...prev]);
        setUploadProgress(0);
        showMessage('success', `"${file.name}" uploaded successfully.`);
      }, 300);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleDownload = async (file) => {
    try {
      const res = await downloadFile(file.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showMessage('error', 'Download failed.');
    }
  };

  const handleDelete = async (file) => {
    try {
      await deleteFile(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      setDeleteConfirm(null);
      showMessage('success', `"${file.original_name}" deleted.`);
    } catch (err) {
      showMessage('error', 'Delete failed.');
    }
  };

  const filteredFiles = files.filter((f) =>
    f.original_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
        <div className="hm-spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h4 style={{ fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.3px' }}>File Manager</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {files.length} file{files.length !== 1 ? 's' : ''} &middot; {formatSize(totalSize)} total
          </p>
        </div>
        <button className="btn btn-primary-hm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <i className="bi bi-cloud-upload me-2"></i>Upload File
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files[0])}
        />
      </div>

      {/* Alerts */}
      {error && <div className="hm-alert hm-alert-error mb-3">{error}</div>}
      {success && <div className="hm-alert hm-alert-success mb-3">{success}</div>}

      {/* Upload zone */}
      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div>
            <div className="upload-icon">📤</div>
            <p>Uploading...</p>
            <div style={{ width: '200px', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', margin: '12px auto 0' }}>
              <div style={{
                height: '100%', background: 'var(--accent)', borderRadius: '2px',
                width: `${uploadProgress}%`, transition: 'width 0.2s',
              }} />
            </div>
            <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>{uploadProgress}%</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">☁️</div>
            <p>
              <span>Click to upload</span> or drag and drop a file here
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Max file size: 50 MB
            </p>
          </>
        )}
      </div>

      {/* Search */}
      {files.length > 0 && (
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <i className="bi bi-search" style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: '14px',
          }} />
          <input
            type="text"
            className="form-control hm-input"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
        </div>
      )}

      {/* Files list */}
      {filteredFiles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{search ? '🔍' : '📁'}</div>
          <h5>{search ? 'No files match your search' : 'No files yet'}</h5>
          <p>{search ? 'Try a different search term' : 'Upload your first file using the button above'}</p>
        </div>
      ) : (
        <div>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 120px 120px',
            padding: '8px 20px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            color: 'var(--text-muted)',
            marginBottom: '4px',
          }}>
            <span>Name</span>
            <span>Size</span>
            <span>Date</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {filteredFiles.map((file) => (
            <div className="file-row" key={file.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                <div className="file-icon">{getFileIcon(file.mimetype)}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="file-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.original_name}
                  </div>
                  <div className="file-meta">{file.mimetype || 'Unknown type'}</div>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', width: '100px', flexShrink: 0 }}>
                {formatSize(file.size)}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', width: '120px', flexShrink: 0 }}>
                {formatDate(file.created_at)}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexShrink: 0 }}>
                <button
                  className="btn-ghost"
                  onClick={() => handleDownload(file)}
                  title="Download"
                  style={{ padding: '7px 12px' }}
                >
                  <i className="bi bi-download"></i>
                </button>
                <button
                  className="btn-danger-hm"
                  onClick={() => setDeleteConfirm(file)}
                  title="Delete"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="hm-modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="hm-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
              <h5>Delete File</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '8px 0 24px' }}>
                Are you sure you want to delete <strong>"{deleteConfirm.original_name}"</strong>?
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-ghost flex-fill" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger-hm flex-fill" onClick={() => handleDelete(deleteConfirm)}
                style={{ padding: '10px' }}>
                <i className="bi bi-trash me-1"></i>Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;
