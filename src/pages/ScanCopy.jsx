import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import { ArrowLeft, Upload, CheckCircle, FileScan, Camera, Image as ImageIcon, AlertCircle, User, BookOpen, Loader2 } from 'lucide-react';
import { API_URL } from '../config';

const ScanCopy = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [conflictData, setConflictData] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('new'); // 'new' or existing id
  
  // Camera state
  const [useCamera, setUseCamera] = useState(false);
  const webcamRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError(null);
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setPreview(imageSrc);
      setFile(dataURLtoFile(imageSrc, 'captured_exam.jpg'));
      setUseCamera(false);
      setError(null);
    }
  }, [webcamRef]);

  const resetSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setConflictData(null);
  }

  const handleResolveConflict = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      
      let res;
      if (selectedVersion === 'new') {
        res = await axios.post(`${API_URL}/api/submissions/confirm-new`, {
          submissionData: conflictData.unsavedSubmission
        }, { headers });
      } else {
        res = await axios.put(`${API_URL}/api/submissions/replace/${selectedVersion}`, {
          submissionData: conflictData.unsavedSubmission
        }, { headers });
      }

      setResult({
        ...res.data,
        examTitle: conflictData.enrichedResult.examTitle,
        studentName: conflictData.enrichedResult.studentName,
        totalPoints: conflictData.enrichedResult.totalPoints
      });
      setConflictData(null);
    } catch (err) {
      setError({ msg: 'Erreur lors de la résolution du conflit.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Veuillez fournir une image de la copie.");

    const formData = new FormData();
    formData.append('scannedImage', file);

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/submissions/scan`, 
        formData, 
        { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } }
      );
      
      if (res.data.conflict) {
        setConflictData(res.data);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError({ msg: 'Erreur de connexion au serveur.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour au Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold">📄 Scanner une copie</h2>
            <p className="mt-2 opacity-90">Scannez une copie d'examen et l'IA identifie automatiquement l'élève, l'examen et corrige les réponses.</p>
          </div>

          <div className="p-4 sm:p-8">
            <form onSubmit={handleUpload} className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FileScan className="mr-2 text-indigo-500"/> Fournir l'image de la copie
              </h3>
              
              <div className="mb-6">
                {/* Method selector */}
                {!preview && (
                  <div className="flex bg-gray-200 rounded-lg p-1 mb-4 max-w-sm">
                    <button type="button" onClick={() => setUseCamera(false)} className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md transition-colors ${!useCamera ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}>
                      <ImageIcon className="w-4 h-4 mr-2"/> Fichier
                    </button>
                    <button type="button" onClick={() => setUseCamera(true)} className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md transition-colors ${useCamera ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}>
                      <Camera className="w-4 h-4 mr-2"/> Appareil Photo
                    </button>
                  </div>
                )}

                {/* Content based on method */}
                {preview ? (
                  <div className="relative border-2 border-dashed border-indigo-300 rounded-xl p-2 bg-white text-center">
                    <img src={preview} alt="Aperçu" className="max-h-64 mx-auto rounded-lg object-contain" />
                    <button type="button" onClick={resetSelection} className="mt-4 text-sm text-red-500 font-medium hover:text-red-700">Changer l'image</button>
                  </div>
                ) : useCamera ? (
                  <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-black flex flex-col items-center p-2">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                      className="w-full max-w-lg rounded-lg"
                    />
                    <button type="button" onClick={capture} className="mt-4 mb-2 bg-white text-gray-900 rounded-full px-6 py-2 font-bold flex items-center shadow-lg hover:bg-gray-100">
                      <Camera className="w-5 h-5 mr-2" /> Prendre la photo
                    </button>
                  </div>
                ) : (
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!file}
                    className="w-full px-4 py-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none"
                  />
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading || !file}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 shadow-md flex justify-center items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                   <span className="animate-pulse flex items-center"><FileScan className="animate-spin h-5 w-5 mr-2" /> Analyse IA en cours...</span>
                ) : (
                  <><Upload className="h-5 w-5 mr-2" /> Lancer la Correction Intelligente</>
                )}
              </button>
            </form>

            {/* Error display */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-6 w-6 text-red-500 mr-2 shrink-0" />
                  <h3 className="text-lg font-bold text-red-800">{error.msg}</h3>
                </div>
                {error.extractedData && (
                  <div className="mt-3 text-sm text-red-700 space-y-1">
                    <p>📝 Examen détecté : <strong>{error.extractedData.examTitle || 'Non trouvé'}</strong></p>
                    <p>👤 Élève détecté : <strong>{error.extractedData.studentName || 'Non trouvé'}</strong></p>
                  </div>
                )}
                {error.availableExams && (
                  <div className="mt-3 text-sm text-red-600">
                    <p className="font-medium">Examens disponibles :</p>
                    <ul className="list-disc ml-5 mt-1">
                      {error.availableExams.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
                {error.availableStudents && (
                  <div className="mt-3 text-sm text-red-600">
                    <p className="font-medium">Élèves disponibles :</p>
                    <ul className="list-disc ml-5 mt-1">
                      {error.availableStudents.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Success result */}
            {result && (
              <div className="mt-8 animate-fade-in-up">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-6">
                  
                  {/* Header with detected info */}
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mr-3 shrink-0" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-green-800">Correction Terminée</h3>
                      <p className="text-green-600 text-sm sm:text-base">Note Globale : <span className="font-bold text-2xl">{result.totalScore}</span> / {result.totalPoints}</p>
                    </div>
                  </div>

                  {/* Detected info badges */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-green-200">
                      <User className="h-4 w-4 text-indigo-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">{result.studentName}</span>
                    </div>
                    <div className="flex items-center bg-white px-3 py-2 rounded-lg border border-green-200">
                      <BookOpen className="h-4 w-4 text-purple-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">{result.examTitle}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <h4 className="font-bold text-gray-700 uppercase text-xs sm:text-sm tracking-wider">Détail par question</h4>
                    {result.answers.map((ans, i) => (
                      <div key={i} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-green-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                         <div className="flex-1">
                           <span className="font-semibold text-gray-800 text-sm sm:text-base">Question {i + 1}</span>
                           <p className="text-xs text-gray-500 mt-1">Réponse : {ans.extractedText}</p>
                           {ans.justification && (
                             <p className="text-xs text-indigo-600 mt-2 bg-indigo-50 p-2 rounded">
                               🤖 <strong>Explication de l'IA:</strong> {ans.justification}
                             </p>
                           )}
                         </div>
                         <div className={`px-3 py-1 rounded-lg font-bold w-fit text-sm shrink-0 self-start sm:self-center ${ans.isCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                           {ans.score} pts
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conflict Modal */}
      {conflictData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center">
              <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
              <h3 className="text-lg font-bold text-orange-800">Copies multiples détectées</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                L'élève <strong>{conflictData.enrichedResult.studentName}</strong> a déjà rendu {conflictData.existingSubmissions.length} copie(s) pour l'examen <strong>{conflictData.enrichedResult.examTitle}</strong>.
              </p>
              
              <p className="text-sm font-semibold text-gray-600 mb-3">Que souhaitez-vous faire avec cette nouvelle copie scannée (Note: {conflictData.unsavedSubmission.totalScore}) ?</p>
              
              <div className="space-y-3 mb-6">
                <label className={`block border rounded-xl p-4 cursor-pointer transition-colors ${selectedVersion === 'new' ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="version_choice" 
                      value="new"
                      checked={selectedVersion === 'new'}
                      onChange={() => setSelectedVersion('new')}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-3 font-medium text-gray-900">Ajouter comme nouvelle version</span>
                  </div>
                  <p className="ml-7 mt-1 text-sm text-gray-500">Utile si l'examen comporte plusieurs pages ou parties.</p>
                </label>

                {conflictData.existingSubmissions.map((sub, idx) => (
                  <label key={sub._id} className={`block border rounded-xl p-4 cursor-pointer transition-colors ${selectedVersion === sub._id ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="version_choice" 
                        value={sub._id}
                        checked={selectedVersion === sub._id}
                        onChange={() => setSelectedVersion(sub._id)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="ml-3 font-medium text-gray-900">Remplacer la copie existante #{idx + 1}</span>
                    </div>
                    <p className="ml-7 mt-1 text-sm text-gray-500">
                      Scannée le : {new Date(sub.createdAt).toLocaleString('fr-FR')} <br/>
                      Ancienne note : <span className="font-bold">{sub.totalScore}</span> pts
                    </p>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => { setConflictData(null); setLoading(false); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-medium rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleResolveConflict}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Confirmer le choix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanCopy;
