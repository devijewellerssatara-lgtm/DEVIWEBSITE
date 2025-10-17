import React, { useState } from 'react';
import './UploadImage.css';

const API_URL = process.env.REACT_APP_API_URL || '';

const UploadImage = () => {
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setStatus('');
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setStatus('Please select an image first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', image);

      setStatus('Uploading...');
      // Note: fetch does not provide native progress events; we show a spinner-like status.
      const res = await fetch(`${API_URL}/api/images`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setProgress(100);
      setStatus('Upload successful!');
      console.log('File available at', `${API_URL}${data.url}`);
    } catch (err) {
      console.error(err);
      setStatus('Upload failed. Please try again.');
    }
  };

  return (
    <div className="upload-container">
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>
      <progress value={progress} max="100" />
      <p>{status}</p>
    </div>
  );
};

export default UploadImage;
