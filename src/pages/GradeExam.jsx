import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import { ArrowLeft, Upload, CheckCircle, FileScan, Camera, Image as ImageIcon } from 'lucide-react';

const GradeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Camera state
  const [useCamera, setUseCamera] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        const [examRes, studentsRes] = await Promise.all([
          axios.get(`https://coorection-copy-server.vercel.app/api/exams/${id}`, { headers }),
          axios.get('https://coorection-copy-server.vercel.app/api/students', { headers })
        ]);
        setExam(examRes.data);
        setStudents(studentsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
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
    }
  }, [webcamRef]);

  const resetSelection = () => {
    setFile(null);
    setPreview(null);
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedStudent) return alert("Veuillez sélectionner un élève et fournir une image.");

    const formData = new FormData();
    formData.append('scannedImage', file);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `https://coorection-copy-server.vercel.app/api/submissions/grade/${id}/${selectedStudent}`, 
        formData, 
        { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } }
      );
      setResult(res.data);
    } catch (err) {
      alert('Erreur lors de la correction OCR/IA');
    } finally {
      setLoading(false);
    }
  };

  if (!exam) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour au Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold">{exam.title}</h2>
            <p className="mt-2 opacity-90">{exam.description}</p>
            <div className="mt-4 inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              {exam.totalPoints} Points Total
            </div>
          </div>

          <div className="p-4 sm:p-8">
            <form onSubmit={handleUpload} className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FileScan className="mr-2 text-indigo-500"/> Scanner & Corriger une copie
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">1. Sélectionner l'élève</label>
                <select 
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                  required
                >
                  <option value="">-- Choisir un élève --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.matricule})</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">2. Fournir l'image de la copie</label>
                
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
                disabled={loading || !file || !selectedStudent}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 shadow-md flex justify-center items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                   <span className="animate-pulse flex items-center"><FileScan className="animate-spin h-5 w-5 mr-2" /> Analyse IA en cours...</span>
                ) : (
                  <><Upload className="h-5 w-5 mr-2" /> Lancer la Correction Intelligente</>
                )}
              </button>
            </form>

            {result && (
              <div className="mt-8 animate-fade-in-up">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mr-3 shrink-0" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-green-800">Correction Terminée</h3>
                      <p className="text-green-600 text-sm sm:text-base">Note Globale : <span className="font-bold text-2xl">{result.totalScore}</span> / {exam.totalPoints}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <h4 className="font-bold text-gray-700 uppercase text-xs sm:text-sm tracking-wider">Détail par question</h4>
                    {result.answers.map((ans, i) => (
                      <div key={i} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-green-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                         <div className="flex-1">
                           <span className="font-semibold text-gray-800 text-sm sm:text-base">Question {i + 1}</span>
                           <p className="text-xs text-gray-500 mt-1">Détection: {ans.extractedText}</p>
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
    </div>
  );
};

export default GradeExam;
