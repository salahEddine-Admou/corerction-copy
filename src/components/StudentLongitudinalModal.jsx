import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader2, Award, TrendingUp, TrendingDown, BookOpen, Brain, Sparkles, AlertCircle, AlertTriangle, Copy, GraduationCap, Trash2 } from 'lucide-react';
import { API_URL } from '../config';

const StudentLongitudinalModal = ({ isOpen, onClose, studentId, studentName, onStudentDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !studentId) return;

    const fetchLongitudinal = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/students/${studentId}/longitudinal`, {
          headers: { 'x-auth-token': token }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.msg || "Impossible de charger la fiche de l'élève.");
      } finally {
        setLoading(false);
      }
    };

    fetchLongitudinal();
  }, [isOpen, studentId]);

  const handleDeleteStudent = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/students/${studentId}`, {
        headers: { 'x-auth-token': token }
      });
      setShowDeleteConfirm(false);
      alert("Élève supprimé avec succès.");
      if (onStudentDeleted) {
        onStudentDeleted(studentId);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Erreur lors de la suppression de l'élève.");
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  const getErrorLabel = (type) => {
    switch (type) {
      case 'knowledge': return 'Connaissances';
      case 'logical': return 'Logique';
      case 'incomplete': return 'Incomplet';
      case 'confusion': return 'Confusion';
      case 'drafting': return 'Rédaction';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 border border-gray-800 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-indigo-600 px-6 py-4 flex justify-between items-center z-20">
          <div className="flex items-center gap-2 text-white">
            <GraduationCap className="h-6 w-6" />
            <h2 className="text-xl font-bold">Suivi Longitudinal & Fiche IA</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-indigo-200 hover:text-white transition-colors p-1 rounded-full hover:bg-indigo-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-gray-300 font-medium">Compilation de l'historique de l'élève...</p>
              <p className="text-gray-500 text-sm mt-1">L'IA analyse les lacunes récurrentes et rédige ses recommandations...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-400 flex flex-col items-center justify-center gap-2">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : data ? (
            <>
              {/* Student Identification */}
              <div className="border-b border-gray-800 pb-4 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {data.student?.firstName} {data.student?.lastName}
                  </h3>
                  <div className="flex gap-4 mt-1 text-sm text-gray-400">
                    <span>Matricule : <strong className="text-gray-300 font-mono">{data.student?.matricule}</strong></span>
                    <span>Classe : <strong className="text-indigo-400">{data.student?.className}</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer l'élève
                </button>
              </div>

              {!data.hasData ? (
                <div className="py-12 text-center text-gray-500">
                  <BookOpen className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-base">{data.msg}</p>
                  <p className="text-xs text-gray-600 mt-2">Dès qu'une copie d'examen sera numérisée, l'analyse s'affichera ici.</p>
                </div>
              ) : (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Moyenne Générale</p>
                      <p className="text-2xl font-extrabold text-white mt-1">
                        {data.stats.averageScore} <span className="text-sm font-medium text-gray-500">/ 20</span>
                      </p>
                    </div>

                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Tendance / Evolution</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {data.stats.progressRate >= 0 ? (
                          <>
                            <TrendingUp className="h-5 w-5 text-green-400" />
                            <span className="text-2xl font-extrabold text-green-400">+{data.stats.progressRate}</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-5 w-5 text-red-400" />
                            <span className="text-2xl font-extrabold text-red-400">{data.stats.progressRate}</span>
                          </>
                        )}
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider ml-1">pts</span>
                      </div>
                    </div>

                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Examens Passés</p>
                      <p className="text-2xl font-extrabold text-indigo-400 mt-1">
                        {data.stats.totalExams} <span className="text-xs font-medium text-gray-500">copie(s)</span>
                      </p>
                    </div>
                  </div>

                  {/* progression list & error breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Test history */}
                    <div className="bg-gray-950/60 p-5 rounded-xl border border-gray-800">
                      <h4 className="text-sm font-bold text-white mb-3">Historique des Évaluations</h4>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {data.history.map((h, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-900 last:border-0">
                            <div>
                              <p className="text-xs font-semibold text-gray-300 truncate max-w-[180px]">{h.examTitle}</p>
                              <p className="text-[10px] text-gray-500">{new Date(h.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-white bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">
                                {h.totalScore} / {h.totalPoints}
                              </span>
                              <p className="text-[9px] text-gray-500 mt-0.5">({h.normalizedScore}/20)</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Error types frequency */}
                    <div className="bg-gray-950/60 p-5 rounded-xl border border-gray-800">
                      <h4 className="text-sm font-bold text-white mb-3">Profil des Difficultés IA</h4>
                      <div className="space-y-2.5">
                        {Object.keys(data.stats.errorTypesCount).map((type, idx) => {
                          const count = data.stats.errorTypesCount[type];
                          const maxErr = Math.max(...Object.values(data.stats.errorTypesCount)) || 1;
                          const pct = (count / maxErr) * 100;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-gray-400 font-medium">{getErrorLabel(type)}</span>
                                <span className="text-gray-500 font-semibold">{count} faute(s)</span>
                              </div>
                              <div className="w-full bg-gray-900 rounded-full h-1.5 border border-gray-800">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* AI pedagogical sheet report */}
                  {data.aiReport && (
                    <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                          Diagnostic IA & Conseil de Remédiation
                        </h4>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(data.aiReport);
                            alert('Fiche copiée dans le presse-papier');
                          }}
                          className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-200 rounded text-xs flex items-center gap-1 transition-colors border border-gray-800"
                        >
                          <Copy className="h-3 w-3" /> Copier
                        </button>
                      </div>
                      <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none bg-gray-900/40 p-3 rounded-lg border border-gray-900/60 font-sans">
                        {data.aiReport}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-gray-850 px-6 py-3 border-t border-gray-800 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors border border-gray-750"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeleteConfirm(false)} />
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h3 className="text-xl font-bold text-white">Supprimer l'élève ?</h3>
            </div>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer l'élève <strong className="text-white">"{studentName || (data?.student?.firstName + ' ' + data?.student?.lastName)}"</strong> ainsi que toutes ses copies d'évaluation ? 
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
                onClick={handleDeleteStudent}
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

export default StudentLongitudinalModal;
