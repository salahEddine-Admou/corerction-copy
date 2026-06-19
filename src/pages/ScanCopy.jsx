import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { ArrowLeft, Upload, CheckCircle, FileScan, Camera, Image as ImageIcon, AlertCircle, User, BookOpen, Loader2, AlertTriangle } from 'lucide-react';
import api from '../api';

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
      let res;
      if (selectedVersion === 'new') {
        res = await api.post('/api/submissions/confirm-new', {
          submissionData: conflictData.unsavedSubmission
        });
      } else {
        res = await api.put(`/api/submissions/replace/${selectedVersion}`, {
          submissionData: conflictData.unsavedSubmission
        });
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
      const res = await api.post(
        '/api/submissions/scan',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
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
    <div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 text-gray-100">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-indigo-400 mb-6 transition-colors group cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" /> Retour au Dashboard
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-gray-800/60 px-6 py-8 relative">
            {/* background subtle glows */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-30 pointer-events-none" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <FileScan className="h-8 w-8 text-indigo-400 animate-pulse" />
              <span>Scanner une copie</span>
            </h2>
            <p className="mt-2 text-gray-400 text-sm sm:text-base font-light max-w-2xl">
              Scannez ou prenez en photo la copie d'un élève. Notre IA se chargera d'identifier automatiquement l'élève, de retrouver l'examen correspondant, et de corriger chaque réponse.
            </p>
          </div>

          <div className="p-4 sm:p-8 space-y-8">
            <form onSubmit={handleUpload} className="bg-gray-950/40 p-4 sm:p-6 rounded-2xl border border-gray-800/80 backdrop-blur-sm shadow-inner">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <ImageIcon className="mr-2.5 text-indigo-400 h-5 w-5"/> Fournir la copie d'examen
              </h3>
              
              <div className="mb-6">
                {/* Method selector */}
                {!preview && (
                  <div className="flex bg-gray-950/80 border border-gray-800 rounded-xl p-1 mb-6 max-w-xs">
                    <button type="button" onClick={() => setUseCamera(false)} className={`flex-1 flex justify-center items-center py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${!useCamera ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-inner' : 'text-gray-400 hover:text-gray-200'}`}>
                      <ImageIcon className="w-3.5 h-3.5 mr-1.5"/> Fichier
                    </button>
                    <button type="button" onClick={() => setUseCamera(true)} className={`flex-1 flex justify-center items-center py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${useCamera ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-inner' : 'text-gray-400 hover:text-gray-200'}`}>
                      <Camera className="w-3.5 h-3.5 mr-1.5"/> Caméra
                    </button>
                  </div>
                )}

                {/* Content based on method */}
                {preview ? (
                  <div className="relative border border-dashed border-indigo-500/20 rounded-2xl p-4 bg-gray-950/50 text-center">
                    <img src={preview} alt="Aperçu de la copie" className="max-h-80 mx-auto rounded-xl object-contain border border-gray-800/50 shadow-lg" />
                    <button type="button" onClick={resetSelection} className="mt-4 text-sm text-red-400 font-medium hover:text-red-300 transition-colors cursor-pointer">
                      Changer de document / Reprendre
                    </button>
                  </div>
                ) : useCamera ? (
                  <div className="border border-gray-800 rounded-2xl overflow-hidden bg-gray-950 flex flex-col items-center p-3 shadow-inner">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                      className="w-full max-w-lg rounded-xl border border-gray-800 shadow-md"
                    />
                    <button type="button" onClick={capture} className="mt-4 mb-2 bg-indigo-600 hover:bg-indigo-50 text-white rounded-full px-6 py-2.5 font-bold flex items-center shadow-lg hover:shadow-indigo-600/30 cursor-pointer active:scale-95 transition-all">
                      <Camera className="w-5 h-5 mr-2" /> Capturer l'image
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      required={!file}
                      id="file-upload"
                      className="peer hidden"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="w-full px-6 py-12 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-950/50 hover:bg-gray-950/80 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:border-indigo-500/40"
                    >
                      <Upload className="h-10 w-10 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                      <div>
                        <p className="text-sm font-semibold text-gray-300">Choisissez une image de copie</p>
                        <p className="text-xs text-gray-500 mt-1">Glissez-déposez ou parcourez vos fichiers (PNG, JPG)</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading || !file}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-indigo-500 hover:shadow-indigo-600/20 shadow-lg flex justify-center items-center transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
              >
                {loading ? (
                   <span className="animate-pulse flex items-center"><Loader2 className="animate-spin h-5 w-5 mr-2" /> Correction par l'IA en cours...</span>
                ) : (
                  <><FileScan className="h-5 w-5 mr-2" /> Lancer la Correction Automatisée</>
                )}
              </button>
            </form>

            {/* Error display */}
            {error && (
              <div className="mt-6 bg-red-950/20 border border-red-500/20 rounded-2xl p-5 sm:p-6 animate-fade-in-up">
                <div className="flex items-center mb-3">
                  <AlertCircle className="h-6 w-6 text-red-400 mr-2.5 shrink-0" />
                  <h3 className="text-lg font-bold text-red-200">{error.msg}</h3>
                </div>
                {error.extractedData && (
                  <div className="mt-4 text-sm text-red-300/80 space-y-2 bg-red-950/30 p-4 rounded-xl border border-red-500/10">
                    <p className="flex items-center gap-1.5">📝 Examen détecté : <strong className="text-white font-semibold">{error.extractedData.examTitle || 'Non détecté'}</strong></p>
                    <p className="flex items-center gap-1.5">👤 Élève détecté : <strong className="text-white font-semibold">{error.extractedData.studentName || 'Non détecté'}</strong></p>
                  </div>
                )}
                {error.availableExams && (
                  <div className="mt-4 text-sm text-red-300">
                    <p className="font-semibold text-white mb-1">Examens disponibles :</p>
                    <ul className="list-disc ml-5 space-y-0.5 opacity-80">
                      {error.availableExams.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </div>
                )}
                {error.availableStudents && (
                  <div className="mt-4 text-sm text-red-300">
                    <p className="font-semibold text-white mb-1">Élèves enregistrés :</p>
                    <ul className="list-disc ml-5 space-y-0.5 opacity-80">
                      {error.availableStudents.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Success result */}
            {result && (
              <div className="mt-8 animate-fade-in-up space-y-6">
                <div className="bg-green-950/10 border border-green-500/20 rounded-2xl p-5 sm:p-6 shadow-lg shadow-green-500/5">
                  
                  {/* Header with score */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-800/60">
                    <div className="flex items-center">
                      <CheckCircle className="h-10 w-10 text-green-400 mr-3.5 shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-white">Copie Corrigée avec Succès</h3>
                        <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Le rapport de correction a été généré avec succès.</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 border border-gray-800 px-5 py-3 rounded-2xl flex items-center gap-2">
                      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Note globale:</span>
                      <span className={`text-2xl font-extrabold ${result.totalScore >= (result.totalPoints / 2) ? 'text-green-400' : 'text-orange-400'}`}>
                        {result.totalScore}
                      </span>
                      <span className="text-gray-600 font-bold">/</span>
                      <span className="text-gray-300 font-bold text-lg">{result.totalPoints}</span>
                    </div>
                  </div>

                  {/* Detected info badges */}
                  <div className="flex flex-wrap gap-3 mb-6 bg-gray-950/60 p-4 rounded-xl border border-gray-800/80">
                    <div className="flex items-center bg-gray-900 px-3.5 py-2 rounded-lg border border-gray-800 text-gray-300">
                      <User className="h-4 w-4 text-indigo-400 mr-2" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1.5">Élève:</span>
                      <span className="text-sm font-medium text-white">{result.studentName}</span>
                    </div>
                    <div className="flex items-center bg-gray-900 px-3.5 py-2 rounded-lg border border-gray-800 text-gray-300">
                      <BookOpen className="h-4 w-4 text-purple-400 mr-2" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1.5">Examen:</span>
                      <span className="text-sm font-medium text-white">{result.examTitle}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm uppercase tracking-wider block ml-1 mb-2">Détail des questions</h4>
                    
                    {result.answers.map((ans, i) => (
                      <div key={i} className="bg-gray-900 border border-gray-800/80 p-4 sm:p-5 rounded-2xl shadow-sm hover:border-gray-700 transition-colors flex flex-col gap-4">
                         
                         {/* Question Header */}
                         <div className="flex justify-between items-center">
                           <span className="font-bold text-white text-sm sm:text-base">Question {i + 1}</span>
                           <div className={`px-3 py-1 rounded-lg font-bold text-xs border ${ans.isCorrect ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                             {ans.score} pts
                           </div>
                         </div>

                         {/* Extracted Answer */}
                         <div className="space-y-1">
                           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Réponse lue sur la copie :</p>
                           <p className="text-sm text-gray-300 italic bg-gray-950 p-3 rounded-xl border border-gray-800 font-mono">
                             "{ans.extractedText || '(Vide)'}"
                           </p>
                         </div>

                         {/* Explanation */}
                         {ans.justification && (
                           <div className="text-xs sm:text-sm text-indigo-300 bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-500/10">
                             <div className="font-semibold text-indigo-400 mb-1 flex items-center gap-1.5">
                               🤖 <span>Analyse de l'IA:</span>
                             </div>
                             <p className="leading-relaxed opacity-95">{ans.justification}</p>
                           </div>
                         )}
                         
                         {/* Plagiarism Risk */}
                         {(ans.plagiarismRisk === 'medium' || ans.plagiarismRisk === 'high') && (
                           <div className={`text-xs p-3.5 rounded-xl flex items-start gap-2.5 border ${
                             ans.plagiarismRisk === 'high' 
                               ? 'bg-red-500/5 text-red-300 border-red-500/10' 
                               : 'bg-orange-500/5 text-orange-300 border-orange-500/10'
                           }`}>
                             <AlertTriangle className={`h-5 w-5 shrink-0 ${ans.plagiarismRisk === 'high' ? 'text-red-400' : 'text-orange-400'}`} />
                             <div>
                               <strong className="block text-white mb-0.5">
                                 {ans.plagiarismRisk === 'high' ? 'Alerte : Risque de plagiat élevé' : 'Alerte : Plagiat possible'}
                               </strong>
                               <span className="opacity-80">{ans.plagiarismDetails}</span>
                             </div>
                           </div>
                         )}
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            <div className="bg-orange-950/20 px-6 py-5 border-b border-orange-500/20 flex items-center">
              <AlertCircle className="h-6 w-6 text-orange-400 mr-2.5 shrink-0" />
              <h3 className="text-lg font-bold text-orange-200">Copies multiples détectées</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-sm text-gray-300 leading-relaxed">
                L'élève <strong className="text-white font-semibold">{conflictData.enrichedResult.studentName}</strong> a déjà rendu <span className="text-indigo-400 font-bold">{conflictData.existingSubmissions.length} copie(s)</span> pour l'examen <strong className="text-white font-semibold">{conflictData.enrichedResult.examTitle}</strong>.
              </p>
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quelle action souhaitez-vous effectuer ?</p>
                <p className="text-xs text-gray-500">(Nouvelle note scannée : <span className="text-white font-semibold">{conflictData.unsavedSubmission.totalScore} pts</span>)</p>
              </div>
              
              <div className="space-y-3">
                <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${selectedVersion === 'new' ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-gray-950/40 border-gray-800 text-gray-300 hover:bg-gray-950/80'}`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="version_choice" 
                      value="new"
                      checked={selectedVersion === 'new'}
                      onChange={() => setSelectedVersion('new')}
                      className="h-4 w-4 text-indigo-600 border-gray-800 bg-gray-950 focus:ring-indigo-500"
                    />
                    <span className="ml-3 font-semibold text-sm">Ajouter comme nouvelle version</span>
                  </div>
                  <p className="ml-7 mt-1 text-xs text-gray-500 leading-normal">Permet de sauvegarder cette copie sans supprimer les versions antérieures.</p>
                </label>

                {conflictData.existingSubmissions.map((sub, idx) => (
                  <label key={sub._id} className={`block border rounded-xl p-4 cursor-pointer transition-all ${selectedVersion === sub._id ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'bg-gray-950/40 border-gray-800 text-gray-300 hover:bg-gray-950/80'}`}>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="version_choice" 
                        value={sub._id}
                        checked={selectedVersion === sub._id}
                        onChange={() => setSelectedVersion(sub._id)}
                        className="h-4 w-4 text-indigo-600 border-gray-800 bg-gray-950 focus:ring-indigo-500"
                      />
                      <span className="ml-3 font-semibold text-sm">Remplacer la copie existante #{conflictData.existingSubmissions.length - idx}</span>
                    </div>
                    <p className="ml-7 mt-1 text-xs text-gray-500 leading-normal">
                      Scannée le : {new Date(sub.createdAt).toLocaleString('fr-FR')} <br/>
                      Ancienne note : <span className="font-semibold text-gray-300">{sub.totalScore}</span> pts
                    </p>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => { setConflictData(null); setLoading(false); }}
                  className="px-4.5 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleResolveConflict}
                  disabled={loading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/10 flex items-center disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Confirmer la sélection
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
