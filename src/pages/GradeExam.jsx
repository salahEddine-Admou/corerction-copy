import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Upload, CheckCircle, FileScan } from 'lucide-react';

const GradeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        const [examRes, studentsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/exams/${id}`, { headers }),
          axios.get('http://localhost:5000/api/students', { headers })
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
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedStudent) return alert("Veuillez sélectionner un élève et un fichier.");

    const formData = new FormData();
    formData.append('scannedImage', file);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/submissions/grade/${id}/${selectedStudent}`, 
        formData, 
        { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } }
      );
      setResult(res.data);
    } catch (err) {
      alert('Erreur lors de la correction OCR');
    } finally {
      setLoading(false);
    }
  };

  if (!exam) return <div className="p-8 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour au Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
            <h2 className="text-3xl font-bold">{exam.title}</h2>
            <p className="mt-2 opacity-90">{exam.description}</p>
            <div className="mt-4 inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              {exam.totalPoints} Points Total
            </div>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleUpload} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FileScan className="mr-2 text-indigo-500"/> Scanner & Corriger une copie
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sélectionner l'élève</label>
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image de la copie (Scan)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="w-full px-4 py-2 border rounded-xl bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 shadow-md flex justify-center items-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                   <span className="animate-pulse">Analyse OCR en cours...</span>
                ) : (
                  <><Upload className="h-5 w-5 mr-2" /> Lancer la Correction Automatique</>
                )}
              </button>
            </form>

            {result && (
              <div className="mt-8 animate-fade-in-up">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <h3 className="text-xl font-bold text-green-800">Correction Terminée</h3>
                      <p className="text-green-600">Note Globale : <span className="font-bold text-2xl">{result.totalScore}</span> / {exam.totalPoints}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <h4 className="font-bold text-gray-700 uppercase text-sm tracking-wider">Détail par question</h4>
                    {result.answers.map((ans, i) => (
                      <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-green-100 flex justify-between items-center">
                         <div>
                           <span className="font-semibold text-gray-800">Question {i + 1}</span>
                           <p className="text-xs text-gray-500 mt-1">Détection: {ans.extractedText}</p>
                           {ans.justification && (
                             <p className="text-xs text-indigo-600 mt-2 bg-indigo-50 p-2 rounded">
                               🤖 <strong>Explication de l'IA:</strong> {ans.justification}
                             </p>
                           )}
                         </div>
                         <div className={`px-3 py-1 rounded-lg font-bold h-fit ${ans.isCorrect ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
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
