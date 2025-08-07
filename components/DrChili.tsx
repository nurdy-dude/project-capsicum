import React, { useState, useCallback } from 'react';
import { api } from '../utils/api';
import { fileToDataUrl } from '../utils/helpers';
import type { Diagnosis } from '../utils/types';

interface DrChiliProps {
  onShareDiagnosis: (diagnosisName: string, imageUrl: string) => void;
  onDiagnoseComplete: () => void;
}

export const DrChili = ({ onShareDiagnosis, onDiagnoseComplete }: DrChiliProps) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
  
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
        const dataUrl = await fileToDataUrl(file);
        setPreviewUrl(dataUrl);
        setDiagnosis(null);
        setError(null);
      }
    };
  
    const handleDiagnose = useCallback(async () => {
      if (!imageFile || !previewUrl) return;
  
      setLoading(true);
      setError(null);
      setDiagnosis(null);
  
      try {
        const base64Image = previewUrl.split(',')[1];
        const mimeType = imageFile.type;
        
        const result = await api.diagnosePlant(base64Image, mimeType);
        setDiagnosis(result);
        onDiagnoseComplete();
  
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to get diagnosis. The model may be unable to identify the issue, or an API error occurred.");
      } finally {
        setLoading(false);
      }
    }, [imageFile, previewUrl, onDiagnoseComplete]);

    const handleShare = () => {
        if (diagnosis && previewUrl) {
            onShareDiagnosis(diagnosis.diseaseName, previewUrl);
        }
    }

    return (
        <>
            <header>
                <h1><span className="chili-icon">🩺</span> Dr. Chili</h1>
                <p>Your AI Chili Doctor</p>
            </header>
            
            <div className="view-content">
                {error && <div className="error-message">{error}</div>}
        
                {!loading && !diagnosis && (
                  <>
                      <input type="file" id="file-upload" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                      <label htmlFor="file-upload" className="uploader">
                          <div className="uploader-icon">📷</div>
                          <p>{imageFile ? 'Change Photo' : 'Upload a photo of your chili plant'}</p>
                      </label>
                  
                      {previewUrl && (
                          <div className="image-preview">
                              <img src={previewUrl} alt="Chili plant preview" />
                          </div>
                      )}
          
                      {imageFile && (
                          <button onClick={handleDiagnose} disabled={loading}>
                              Diagnose Plant
                          </button>
                      )}
                  </>
                )}
        
                {loading && (
                  <div className="loader-container">
                    <div className="loader"></div>
                    <p>Dr. Chili is examining your plant...</p>
                  </div>
                )}
        
                {diagnosis && (
                  <>
                    <div className="image-preview">
                        <img src={previewUrl!} alt="Analyzed chili plant" />
                    </div>
                    <div className="results-card">
                      <h2>Diagnosis Result</h2>
                      <h3>{diagnosis.diseaseName}</h3>
                      <p>{diagnosis.description}</p>
                      
                      <h3>Organic Treatments</h3>
                      <ul>
                        {diagnosis.organicTreatment.map((item, index) => <li key={`org-${index}`}>{item}</li>)}
                      </ul>
                      
                      <h3>Chemical Treatments</h3>
                      <ul>
                        {diagnosis.chemicalTreatment.map((item, index) => <li key={`chem-${index}`}>{item}</li>)}
                      </ul>
                    </div>
                    <button onClick={handleShare}>Share for Feedback</button>
                    <button onClick={() => {
                        setImageFile(null);
                        setPreviewUrl(null);
                        setDiagnosis(null);
                    }} style={{backgroundColor: 'var(--text-light-color)'}}>Start New Diagnosis</button>
                  </>
                )}
            </div>
        </>
    );
};