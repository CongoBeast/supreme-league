import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { Camera, CheckCircle2, Trash2, UploadCloud } from 'lucide-react';
import { api } from '../services/api';
import ProfileAvatar from './ProfileAvatar';
import './profile-picture-uploader.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The browser could not read the selected file.'));
    reader.readAsDataURL(file);
  });
}

function confirmBrowserCanRender(url) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('The selected file is labelled as an image, but this browser cannot render it.'));
    image.src = url;
  });
}

export default function ProfilePictureUploader({ currentUrl, userName, onChanged }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const resetSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const chooseFile = async (selectedFile) => {
    setError('');
    setNotice('');
    resetSelection();
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Only PNG, JPEG, and WebP images can be uploaded. SVG, PDF, and other file types are not accepted.');
      return;
    }
    if (!selectedFile.size || selectedFile.size > MAX_BYTES) {
      setError('The profile picture must be 2 MB or smaller.');
      return;
    }

    const nextPreview = URL.createObjectURL(selectedFile);
    try {
      await confirmBrowserCanRender(nextPreview);
      setFile(selectedFile);
      setPreviewUrl(nextPreview);
      setNotice('Preview ready. Click “Upload picture” to save it.');
    } catch (renderError) {
      URL.revokeObjectURL(nextPreview);
      setError(renderError.message);
    }
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const image = await fileToDataUrl(file);
      const response = await api('/api/profile/picture', {
        method: 'POST',
        body: { image },
      });
      onChanged?.(response);
      setNotice(response.message || 'Profile picture uploaded successfully.');
      resetSelection();
    } catch (uploadError) {
      setError(uploadError.message || 'The image could not be uploaded.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!currentUrl || !window.confirm('Remove your current profile picture?')) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await api('/api/profile/picture', { method: 'DELETE' });
      onChanged?.(response);
      setNotice(response.message || 'Profile picture removed.');
      resetSelection();
    } catch (removeError) {
      setError(removeError.message || 'The image could not be removed.');
    } finally {
      setBusy(false);
    }
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="profile-picture-uploader">
      <div className="profile-picture-stage">
        <ProfileAvatar
          src={displayUrl}
          name={userName}
          size="lg"
          className="profile-picture-preview"
          onImageError={() => setError(
            previewUrl
              ? 'The selected image could not be rendered. Choose a different PNG, JPEG, or WebP file.'
              : 'The stored image could not be displayed. It may have been removed from Cloudinary or blocked by the browser.'
          )}
        />
        {busy && (
          <div className="profile-picture-busy" aria-live="polite">
            <Spinner animation="border" size="sm" />
            <span>{file ? 'Uploading…' : 'Updating…'}</span>
          </div>
        )}
        {previewUrl && <span className="profile-picture-preview-badge">Preview</span>}
      </div>

      <input
        ref={inputRef}
        id="profile-picture-file"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(event) => chooseFile(event.target.files?.[0])}
      />

      <div className="profile-picture-actions">
        <Button
          as="label"
          htmlFor="profile-picture-file"
          variant="outline-dark"
          disabled={busy}
        >
          <Camera size={16} />
          Choose image
        </Button>
        {file && (
          <Button onClick={upload} disabled={busy}>
            {busy ? <Spinner animation="border" size="sm" /> : <UploadCloud size={16} />}
            Upload picture
          </Button>
        )}
        {file && (
          <Button variant="link" className="text-secondary" onClick={resetSelection} disabled={busy}>
            Cancel
          </Button>
        )}
        {!file && currentUrl && (
          <Button variant="link" className="text-danger" onClick={remove} disabled={busy}>
            <Trash2 size={16} />
            Remove
          </Button>
        )}
      </div>

      {file && (
        <div className="profile-picture-file-summary">
          <CheckCircle2 size={16} />
          <span>{file.name}</span>
          <span>{formatBytes(file.size)}</span>
        </div>
      )}

      <p className="small muted mb-2">
        PNG, JPEG, or WebP only. Maximum 2 MB. Images are stored securely through Cloudinary.
      </p>
      {error && <Alert variant="danger" className="py-2 mb-2">{error}</Alert>}
      {notice && <Alert variant="success" className="py-2 mb-0">{notice}</Alert>}
    </div>
  );
}
