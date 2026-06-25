import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Loader2, FileText, CheckCircle2, ChevronRight, XCircle, 
  FileScan, Users, GraduationCap, AlertTriangle, Edit3, Save, 
  Sparkles, Brain, Download, Copy, Check, Trash2 
} from 'lucide-react';
import { API_URL } from '../config';

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results'); // 'results', 'questions', or 'analytics'
  const [selectedStudentGroup, setSelectedStudentGroup] = useState(null);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const fetchAnalytics = async () => {
    if (analyticsData) return;
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/exams/${id}/class-analytics`, {
        headers: { 'x-auth-token': token }
      });
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to fetch class analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentGroup && selectedStudentGroup.versions && selectedStudentGroup.versions[activeVersionIndex]) {
      const currentVersion = selectedStudentGroup.versions[activeVersionIndex];
      setEditedAnswers(currentVersion.answers.map(ans => ({
        questionId: ans.questionId,
        score: ans.score,
        justification: ans.justification || ans.justificationProf || ''
      })));
    } else {
      setIsEditing(false);
    }
  }, [selectedStudentGroup, activeVersionIndex]);

  const handleScoreChange = (qIndex, value, maxScore) => {
    let val = Number(value);
    if (val < 0) val = 0;
    if (val > maxScore) val = maxScore;
    const newEdits = [...editedAnswers];
    newEdits[qIndex].score = val;
    setEditedAnswers(newEdits);
  };

  const handleJustificationChange = (qIndex, value) => {
    const newEdits = [...editedAnswers];
    newEdits[qIndex].justification = value;
    setEditedAnswers(newEdits);
  };

  const handleSaveEdits = async () => {
    const currentVersion = selectedStudentGroup.versions[activeVersionIndex];
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/api/submissions/${currentVersion._id}/edit`, {
        answers: editedAnswers,
        studentName: `${selectedStudentGroup.student.firstName} ${selectedStudentGroup.student.lastName}`
      }, {
        headers: { 'x-auth-token': token }
      });
      
      const updatedSubmissions = submissions.map(sub => {
        if (sub._id === currentVersion._id) {
          return {
            ...sub,
            answers: res.data.answers,
            totalScore: res.data.totalScore,
            totalScoreProf: res.data.totalScoreProf,
            twinSimilarityScore: res.data.twinSimilarityScore,
            status: res.data.status
          };
        }
        return sub;
      });
      setSubmissions(updatedSubmissions);
      
      const updatedVersions = selectedStudentGroup.versions.map((ver, idx) => {
        if (idx === activeVersionIndex) {
          return {
            ...ver,
            answers: res.data.answers,
            totalScore: res.data.totalScore,
            totalScoreProf: res.data.totalScoreProf,
            twinSimilarityScore: res.data.twinSimilarityScore,
            status: res.data.status
          };
        }
        return ver;
      });
      setSelectedStudentGroup({
        ...selectedStudentGroup,
        versions: updatedVersions
      });
      
      setIsEditing(false);
      setAnalyticsData(null); // Force reload analytics next time
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde des modifications.");
    }
  };

  const getErrorLabel = (type) => {
    switch (type) {
      case 'knowledge': return { label: 'Erreur de connaissances', color: 'bg-red-500/10 text-red-400 border border-red-500/20' };
      case 'logical': return { label: 'Erreur logique', color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' };
      case 'incomplete': return { label: 'Raisonnement incomplet', color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' };
      case 'confusion': return { label: 'Confusion conceptuelle', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
      case 'drafting': return { label: 'Défaut de rédaction', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
      default: return null;
    }
  };

  const downloadReport = () => {
    if (!analyticsData || !analyticsData.aiReport) return;
    const element = document.createElement("a");
    const file = new Blob([analyticsData.aiReport], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `rapport_pedagogique_${exam.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeleteExam = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/exams/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setShowDeleteConfirm(false);
      alert("Examen supprimé avec succès.");
      navigate('/dashboard?tab=exams');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Erreur lors de la suppression de l'examen.");
    } finally {
      setDeleting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-400 font-medium">Chargement des détails...</p>
      </div>
    );
  }

  if (!exam) return <div className="p-8 text-center text-gray-500">Examen introuvable.</div>;

  // Grouper les soumissions par élève
  const groupedSubmissions = submissions.reduce((acc, sub) => {
    if (!sub.student) return acc;
    const studentId = sub.student._id;
    if (!acc[studentId]) {
      acc[studentId] = {
        student: sub.student,
        versions: []
      };
    }
    acc[studentId].versions.push(sub);
    return acc;
  }, {});

  // Convertir en tableau et trier les versions de la plus récente à la plus ancienne pour chaque élève
  const uniqueStudents = Object.values(groupedSubmissions).map(group => {
    group.versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return group;
  });

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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Examen</span>
                <span className="text-gray-400 text-sm">{new Date(exam.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" /> Supprimer l'examen
              </button>
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
            <Users className="h-4 w-4 mr-2" /> Résultats ({uniqueStudents.length} élèves)
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'questions' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
            <FileText className="h-4 w-4 mr-2" /> Questions
          </button>
          <button 
            onClick={() => {
              setActiveTab('analytics');
              fetchAnalytics();
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
          >
            <GraduationCap className="h-4 w-4 mr-2" /> Analyse de classe
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
                    {uniqueStudents.map(group => {
                      const latestVersion = group.versions[0];
                      return (
                        <tr key={group.student._id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{group.student.firstName} {group.student.lastName}</span>
                              {latestVersion.status === 'needs_review' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 gap-0.5 animate-pulse">
                                  <AlertTriangle className="h-3 w-3" /> À revoir
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{group.student.matricule}</div>
                          </td>
                          <td className="p-4 text-sm text-gray-400">
                            {new Date(latestVersion.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                            {group.versions.length > 1 && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                                {group.versions.length} versions
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-gray-800 border border-gray-700">
                              <span className={latestVersion.totalScore >= (exam.totalPoints / 2) ? 'text-green-400' : 'text-orange-400'}>
                                {latestVersion.totalScore}
                              </span>
                              <span className="text-gray-500 mx-1">/</span>
                              <span className="text-gray-400">{exam.totalPoints}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => {
                                setSelectedStudentGroup(group);
                                setActiveVersionIndex(0); // Select the latest version by default
                              }} 
                              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium hover:underline flex items-center justify-end w-full"
                            >
                              Détails <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-300 font-medium">L'IA analyse les résultats de la classe...</p>
                <p className="text-gray-500 text-sm mt-1">Calcul des statistiques et rédaction du rapport en cours...</p>
              </div>
            ) : analyticsData && analyticsData.hasData ? (
              <>
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">Moyenne de la classe</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white">{analyticsData.stats.avgScore}</span>
                      <span className="text-gray-500">/ {analyticsData.stats.maxPoints}</span>
                    </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">Note Médiane</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white">{analyticsData.stats.medianScore}</span>
                      <span className="text-gray-500">/ {analyticsData.stats.maxPoints}</span>
                    </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium font-semibold">Taux de participation</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-green-400">{analyticsData.stats.numSubmissions}</span>
                      <span className="text-gray-500">élèves évalués</span>
                    </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500 font-medium">Erreur dominante</p>
                    <div className="mt-2">
                      {(() => {
                        const breakdown = analyticsData.stats.errorBreakdown;
                        let maxType = 'none';
                        let maxVal = -1;
                        Object.keys(breakdown).forEach(type => {
                          if (type !== 'none' && breakdown[type] > maxVal) {
                            maxVal = breakdown[type];
                            maxType = type;
                          }
                        });
                        const errDetails = getErrorLabel(maxType);
                        return errDetails ? (
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${errDetails.color}`}>
                            {errDetails.label}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm font-medium">Aucune erreur type</span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Grade Distribution & Error Breakdown Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Distribution graph */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-4">Distribution des notes (sur 20)</h3>
                    {(() => {
                      const dist = analyticsData.stats.distribution;
                      const maxVal = Math.max(dist.dist0_5, dist.dist5_10, dist.dist10_15, dist.dist15_20) || 1;
                      const categories = [
                        { label: '0 - 5', count: dist.dist0_5, color: 'bg-red-500' },
                        { label: '5 - 10', count: dist.dist5_10, color: 'bg-orange-500' },
                        { label: '10 - 15', count: dist.dist10_15, color: 'bg-yellow-500' },
                        { label: '15 - 20', count: dist.dist15_20, color: 'bg-green-500' }
                      ];
                      return (
                        <div className="flex justify-between items-end h-48 pt-6 border-b border-gray-800 px-4">
                          {categories.map((cat, idx) => {
                            const pctHeight = (cat.count / maxVal) * 100;
                            return (
                              <div key={idx} className="flex flex-col items-center w-12 gap-2">
                                <span className="text-xs text-gray-400 font-bold">{cat.count}</span>
                                <div className={`w-full rounded-t-lg ${cat.color}`} style={{ height: `${pctHeight}%`, minHeight: cat.count > 0 ? '4px' : '0px' }} />
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold whitespace-nowrap mt-2">{cat.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Errors Types Breakdown */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-4">Typologie des erreurs commises</h3>
                    <div className="space-y-3.5">
                      {Object.keys(analyticsData.stats.errorBreakdown)
                        .filter(type => type !== 'none')
                        .map((type, idx) => {
                          const count = analyticsData.stats.errorBreakdown[type];
                          const labelInfo = getErrorLabel(type);
                          if (!labelInfo) return null;
                          const maxErrVal = Math.max(...Object.keys(analyticsData.stats.errorBreakdown).filter(t => t !== 'none').map(t => analyticsData.stats.errorBreakdown[t])) || 1;
                          const pct = (count / maxErrVal) * 100;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-gray-300">{labelInfo.label}</span>
                                <span className="text-gray-400">{count} fois</span>
                              </div>
                              <div className="w-full bg-gray-950 rounded-full h-2.5 border border-gray-800">
                                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Success Rate per Question */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-white mb-4">Taux de réussite par question</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analyticsData.stats.successRates.map((q, idx) => (
                      <div key={idx} className="p-4 bg-gray-950 border border-gray-800/80 rounded-xl space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm text-gray-300 font-medium line-clamp-2">{q.questionText}</span>
                          <span className="text-indigo-400 text-xs font-bold shrink-0">{q.successRate}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${q.successRate}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-500 font-semibold uppercase">{q.avgPoints} / {q.maxPoints} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performing vs Struggling Students */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Struggling Students */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      Élèves ayant besoin de renforcement
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Élèves ayant obtenu moins de la moyenne ({analyticsData.stats.maxPoints / 2} pts)</p>
                    <div className="space-y-2">
                      {analyticsData.stats.strugglingStudents.map((st, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-950/60 rounded-xl border border-gray-850">
                          <span className="text-sm font-medium text-white">{st.name}</span>
                          <span className="text-sm font-bold text-orange-400">{st.score} / {analyticsData.stats.maxPoints}</span>
                        </div>
                      ))}
                      {analyticsData.stats.strugglingStudents.length === 0 && (
                        <p className="text-sm text-gray-500 italic py-2">Aucun élève en difficulté.</p>
                      )}
                    </div>
                  </div>

                  {/* Performing Students */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      Élèves performants
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Élèves ayant obtenu plus de 75% des points</p>
                    <div className="space-y-2">
                      {analyticsData.stats.performingStudents.map((st, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-950/60 rounded-xl border border-gray-850">
                          <span className="text-sm font-medium text-white">{st.name}</span>
                          <span className="text-sm font-bold text-green-400">{st.score} / {analyticsData.stats.maxPoints}</span>
                        </div>
                      ))}
                      {analyticsData.stats.performingStudents.length === 0 && (
                        <p className="text-sm text-gray-500 italic py-2">Aucun élève dans cette catégorie.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI pedagogical report */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                      Rapport Pédagogique IA
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(analyticsData.aiReport);
                          alert('Copié dans le presse-papier');
                        }}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copier
                      </button>
                      <button
                        onClick={downloadReport}
                        className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-indigo-500/20"
                      >
                        <Download className="h-3.5 w-3.5" /> Télécharger
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-950 p-5 rounded-xl border border-gray-850 prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {analyticsData.aiReport}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                <p className="text-gray-500 italic">Aucune donnée disponible pour le moment.</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Submission Details Modal */}
      {selectedStudentGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Copies de {selectedStudentGroup.student.firstName} {selectedStudentGroup.student.lastName}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedStudentGroup(null);
                  setActiveVersionIndex(0);
                  setIsEditing(false);
                }}
                className="text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 p-2 rounded-full transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Version Tabs */}
            {selectedStudentGroup.versions.length > 1 && !isEditing && (
              <div className="bg-gray-800/50 px-6 py-2 border-b border-gray-700 flex overflow-x-auto gap-2">
                {selectedStudentGroup.versions.map((version, idx) => (
                  <button
                    key={version._id}
                    onClick={() => setActiveVersionIndex(idx)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeVersionIndex === idx 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    }`}
                  >
                    Version {selectedStudentGroup.versions.length - idx}
                    <span className="ml-2 text-xs opacity-70">({version.totalScore} pts)</span>
                  </button>
                ))}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {(() => {
                const currentVersion = selectedStudentGroup.versions[activeVersionIndex];
                return (
                  <>
                    <div className="mb-6 flex flex-wrap gap-4 justify-between items-center bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Date de scan</p>
                        <p className="text-white font-medium text-sm">{new Date(currentVersion.createdAt).toLocaleString('fr-FR')}</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="bg-gray-900 px-3 py-2 rounded-lg border border-gray-800 text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-semibold">Confiance IA</p>
                          <div className="mt-0.5 flex items-center justify-center gap-1">
                            <span className={`text-sm font-bold ${currentVersion.confidenceIndex >= 85 ? 'text-green-400' : currentVersion.confidenceIndex >= 60 ? 'text-yellow-400' : 'text-red-400 animate-pulse'}`}>{currentVersion.confidenceIndex}%</span>
                          </div>
                        </div>

                        <div className="bg-gray-900 px-3 py-2 rounded-lg border border-gray-800 text-center">
                          <p className="text-[10px] text-gray-500 uppercase font-semibold">Jumeau Numérique</p>
                          <div className="mt-0.5 flex items-center justify-center gap-1 text-indigo-400">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="text-sm font-bold">{currentVersion.twinSimilarityScore || 100}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Note Globale</p>
                        <p className="text-lg">
                          <span className={currentVersion.totalScore >= (exam.totalPoints / 2) ? 'text-green-400 font-bold' : 'text-orange-400 font-bold'}>
                            {currentVersion.totalScore}
                          </span> 
                          <span className="text-gray-500 mx-0.5">/</span> 
                          <span className="text-gray-300 font-bold">{exam.totalPoints} pts</span>
                        </p>
                      </div>
                    </div>

                    {currentVersion.scannedImage && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Image Scannée</h4>
                        <div className="bg-gray-950 p-2 rounded-xl border border-gray-800">
                          <img 
                            src={`${API_URL}/${currentVersion.scannedImage}`} 
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
                      {currentVersion.answers.map((ans, i) => {
                        const edit = editedAnswers[i] || { score: ans.score, justification: ans.justification || '' };
                        return (
                          <div key={i} className="bg-gray-950 p-5 rounded-xl shadow-sm border border-gray-800 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-semibold text-white block">Question {i + 1}</span>
                                {exam.questions && exam.questions[i] && (
                                  <span className="text-xs text-gray-500 font-medium">{exam.questions[i].questionText}</span>
                                )}
                              </div>
                              <div className="shrink-0 flex items-center gap-2">
                                {isEditing ? (
                                  <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 px-2 py-1 rounded-lg">
                                    <input 
                                      type="number"
                                      step="0.5"
                                      min="0"
                                      max={exam.questions && exam.questions[i] ? exam.questions[i].points : ans.score}
                                      value={edit.score}
                                      onChange={(e) => handleScoreChange(i, e.target.value, exam.questions && exam.questions[i] ? exam.questions[i].points : 20)}
                                      className="w-14 bg-gray-950 border border-gray-700 text-white rounded px-1.5 py-0.5 text-sm font-bold text-center focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-500 text-xs font-semibold">/ {exam.questions && exam.questions[i] ? exam.questions[i].points : 0} pts</span>
                                  </div>
                                ) : (
                                  <div className={`px-3 py-1 rounded-lg font-bold text-sm ${ans.isCorrect ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                    {ans.score} / {exam.questions && exam.questions[i] ? exam.questions[i].points : ans.score} pts
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {ans.errorType && ans.errorType !== 'none' && (
                              <div className="flex flex-wrap items-center gap-2">
                                {(() => {
                                  const errInfo = getErrorLabel(ans.errorType);
                                  return errInfo ? (
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${errInfo.color}`}>
                                      {errInfo.label}
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                            )}

                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Texte lu par l'IA :</p>
                              <p className="text-gray-300 text-sm italic bg-gray-900 p-2.5 rounded border border-gray-850 leading-relaxed font-mono">
                                "{ans.extractedText}"
                              </p>
                            </div>

                            {/* Tags de Correction Explicable */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1">
                              {ans.elementsExpected && ans.elementsExpected.length > 0 && (
                                <div className="bg-gray-900/50 p-2 rounded border border-gray-800/80">
                                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Attendus</span>
                                  <div className="flex flex-wrap gap-1">
                                    {ans.elementsExpected.map((el, idx) => (
                                      <span key={idx} className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-[10px] border border-gray-700">
                                        {el}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {ans.elementsFound && ans.elementsFound.length > 0 && (
                                <div className="bg-green-500/5 p-2 rounded border border-green-500/10">
                                  <span className="block text-[10px] font-bold text-green-400/80 uppercase tracking-wider mb-1">Trouvés</span>
                                  <div className="flex flex-wrap gap-1">
                                    {ans.elementsFound.map((el, idx) => (
                                      <span key={idx} className="bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded text-[10px] border border-green-500/20">
                                        {el}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {ans.elementsMissing && ans.elementsMissing.length > 0 && (
                                <div className="bg-red-500/5 p-2 rounded border border-red-500/10">
                                  <span className="block text-[10px] font-bold text-red-400/80 uppercase tracking-wider mb-1">Manquants</span>
                                  <div className="flex flex-wrap gap-1">
                                    {ans.elementsMissing.map((el, idx) => (
                                      <span key={idx} className="bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded text-[10px] border border-red-500/20">
                                        {el}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Cognitive Diagnosis */}
                            {ans.cognitiveDiagnosis && (
                              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 flex gap-2 text-xs text-amber-300">
                                <Brain className="h-4 w-4 shrink-0 text-amber-400" />
                                <div>
                                  <span className="font-semibold block mb-0.5">🧠 Analyse cognitive :</span>
                                  <span className="opacity-90 leading-normal">{ans.cognitiveDiagnosis}</span>
                                </div>
                              </div>
                            )}

                            {/* Justification / Comments */}
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Justification / Commentaire :</p>
                              {isEditing ? (
                                <textarea
                                  value={edit.justification}
                                  onChange={(e) => handleJustificationChange(i, e.target.value)}
                                  rows="2"
                                  className="w-full bg-gray-900 border border-gray-700 text-white rounded p-2 text-sm focus:ring-1 focus:ring-indigo-500"
                                  placeholder="Entrez vos remarques ou modifications..."
                                />
                              ) : (
                                <div className="text-sm text-indigo-300 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20 leading-relaxed font-sans whitespace-pre-wrap">
                                  <span className="block font-semibold mb-1 flex items-center text-xs">
                                    🤖 Remarques du correcteur :
                                  </span>
                                  {ans.justification}
                                </div>
                              )}
                            </div>

                            {/* Plagiarism details */}
                            {(ans.plagiarismRisk === 'medium' || ans.plagiarismRisk === 'high') && (
                              <div className={`text-sm p-3 rounded-lg flex items-start gap-2 border ${ans.plagiarismRisk === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <div>
                                  <strong className="block mb-1 text-xs">{ans.plagiarismRisk === 'high' ? '⚠️ Risque de Plagiat Élevé' : '⚠️ Alerte IA/Plagiat Possible'}</strong>
                                  <span className="opacity-90 text-xs">{ans.plagiarismDetails}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex justify-between items-center">
              <div>
                {isEditing ? (
                  <button 
                    onClick={handleSaveEdits}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-green-500/10"
                  >
                    <Save className="h-4 w-4" /> Enregistrer la copie
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-500/10"
                  >
                    <Edit3 className="h-4 w-4" /> Éditer la copie
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {isEditing && (
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-700 hover:bg-gray-650 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Annuler
                  </button>
                )}
                <button 
                  onClick={() => {
                    setSelectedStudentGroup(null);
                    setActiveVersionIndex(0);
                    setIsEditing(false);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeleteConfirm(false)} />
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h3 className="text-xl font-bold text-white">Supprimer l'examen ?</h3>
            </div>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer l'examen <strong className="text-white">"{exam?.title}"</strong> ainsi que toutes les copies corrigées associées ? 
              <span className="block mt-2 text-red-400/90 font-semibold text-xs">⚠️ Cette action est irréversible.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteExam}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetails;
