import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, FileText, CheckCircle2, ChevronRight, XCircle, FileScan, Users, GraduationCap } from 'lucide-react';
import { API_URL } from '../config';

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results'); // 'results' or 'questions'
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'x-auth-token': token };
        
        const [examRes, submissionsRes] = await Promise.all([
          axios.get(`${API_URL}/api/exams/${id}`, { headers }),
          axios.get(`${API_URL}/api/submissions/exam/${id}`, { headers })
        ]);
        
        setExam(examRes.data);
        setSubmissions(submissionsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Chargement des détails...</p>
      </div>
    );
  }

  if (!exam) return <div className="p-8 text-center text-gray-500">Examen introuvable.</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10 px-4 sm:px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" /> Retour au Dashboard
        </button>
        <Link to="/scan-copy" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors shadow-lg shadow-indigo-500/20">
          <FileScan className="h-4 w-4 mr-2" /> Scanner une copie
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <GraduationCap className="h-48 w-48" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Examen</span>
              <span className="text-gray-400 text-sm">{new Date(exam.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{exam.title}</h1>
            <p className="text-gray-400 max-w-2xl text-lg">{exam.description || 'Aucune description fournie.'}</p>
            
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-800">
              <div>
                <p className="text-sm text-gray-500">Total des points</p>
                <p className="text-2xl font-bold text-white">{exam.totalPoints}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Questions</p>
                <p className="text-2xl font-bold text-white">{exam.questions?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Copies corrigées</p>
                <p className="text-2xl font-bold text-green-400">{submissions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-gray-900 p-1 rounded-xl w-fit border border-gray-800">
          <button 
            onClick={() => setActiveTab('results')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'results' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
            <Users className="h-4 w-4 mr-2" /> Résultats ({submissions.length})
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'questions' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
            <FileText className="h-4 w-4 mr-2" /> Questions
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'results' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            {submissions.length === 0 ? (
              <div className="p-12 text-center">
                <FileScan className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">Aucune copie scannée</h3>
                <p className="text-gray-500 mb-6">Commencez par scanner les copies de vos élèves pour voir les résultats ici.</p>
                <Link to="/scan-copy" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 hover:underline">
                  Aller au scanner <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-800/50 border-b border-gray-800">
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Élève</th>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date de correction</th>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Note Finale</th>
                      <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {submissions.map(sub => (
                      <tr key={sub._id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{sub.student?.firstName} {sub.student?.lastName}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{sub.student?.matricule}</div>
                        </td>
                        <td className="p-4 text-sm text-gray-400">
                          {new Date(sub.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td className="p-4">
                          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-gray-800 border border-gray-700">
                            <span className={sub.totalScore >= (exam.totalPoints / 2) ? 'text-green-400' : 'text-orange-400'}>
                              {sub.totalScore}
                            </span>
                            <span className="text-gray-500 mx-1">/</span>
                            <span className="text-gray-400">{exam.totalPoints}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => setSelectedSubmission(sub)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium hover:underline flex items-center justify-end w-full">
                            Détails <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-4">
            {exam.questions.map((q, i) => (
              <div key={q._id || i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="font-bold text-lg text-white">
                    <span className="text-indigo-500 mr-2">Q{i + 1}.</span> {q.questionText}
                  </h3>
                  <span className="bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-lg text-sm font-bold shrink-0">
                    {q.points} pts
                  </span>
                </div>
                
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mots-clés attendus</p>
                  <div className="flex flex-wrap gap-2">
                    {q.expectedKeywords.map((kw, j) => (
                      <span key={j} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-md text-sm">
                        {kw}
                      </span>
                    ))}
                    {q.expectedKeywords.length === 0 && (
                      <span className="text-gray-600 text-sm italic">Aucun mot-clé spécifié</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Copie de {selectedSubmission.student?.firstName} {selectedSubmission.student?.lastName}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Note: <span className={selectedSubmission.totalScore >= (exam.totalPoints / 2) ? 'text-green-400 font-bold' : 'text-orange-400 font-bold'}>{selectedSubmission.totalScore}</span> / {exam.totalPoints} pts
                </p>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 p-2 rounded-full transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {selectedSubmission.scannedImage && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Image Scannée</h4>
                  <div className="bg-gray-950 p-2 rounded-xl border border-gray-800">
                    <img 
                      src={`${API_URL}/${selectedSubmission.scannedImage}`} 
                      alt="Copie scannée" 
                      className="max-h-64 mx-auto rounded-lg object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<p class="text-gray-500 text-center text-sm py-4">Image non disponible</p>';
                      }}
                    />
                  </div>
                </div>
              )}

              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Détail des réponses</h4>
              <div className="space-y-4">
                {selectedSubmission.answers.map((ans, i) => (
                  <div key={i} className="bg-gray-950 p-4 rounded-xl shadow-sm border border-gray-800 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-white">Question {i + 1}</span>
                      <div className={`px-3 py-1 rounded-lg font-bold text-sm shrink-0 ${ans.isCorrect ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                        {ans.score} pts
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Texte lu par l'IA :</p>
                      <p className="text-gray-300 text-sm italic bg-gray-900 p-2 rounded border border-gray-800">
                        "{ans.extractedText}"
                      </p>
                    </div>

                    {ans.justification && (
                      <div className="mt-2 text-sm text-indigo-300 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                        <span className="block font-semibold mb-1 flex items-center">
                          🤖 Justification de la note :
                        </span>
                        {ans.justification}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex justify-end">
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetails;
