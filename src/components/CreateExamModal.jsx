import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Plus, Save, Trash2, Loader2, X, Camera } from 'lucide-react';
import { API_URL } from '../config';

const CreateExamModal = ({ isOpen, onClose, onExamCreated }) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: 'Question 1', questionType: 'short', points: 1, expectedKeywords: '' }
  ]);
  const fileInputRef = useRef(null);

  const handleSubjectPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setGenerating(true);
    const formData = new FormData();
    formData.append('subjectImage', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/exams/generate-rubric`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });

      const { title: newTitle, description: newDescription, questions: newQuestions } = res.data;
      if (newTitle) setTitle(newTitle);
      if (newDescription) setDescription(newDescription);
      if (newQuestions && newQuestions.length > 0) {
        setQuestions(newQuestions.map(q => ({
          questionText: q.questionText || '',
          questionType: q.questionType || 'short',
          points: q.points || 1,
          expectedKeywords: Array.isArray(q.expectedKeywords) ? q.expectedKeywords.join(', ') : (q.expectedKeywords || '')
        })));
      }
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération automatique du barème depuis le sujet.');
    } finally {
      setGenerating(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  if (!isOpen) return null;

  const handleNumQuestionsChange = (value) => {
    const count = Math.max(1, Math.min(30, Number(value) || 1));
    let newQuestions = [...questions];
    if (count > newQuestions.length) {
      for (let i = newQuestions.length; i < count; i++) {
        newQuestions.push({
          questionText: `Question ${i + 1}`,
          questionType: 'short',
          points: 1,
          expectedKeywords: ''
        });
      }
    } else if (count < newQuestions.length) {
      newQuestions = newQuestions.slice(0, count);
    }
    setQuestions(newQuestions);
  };

  const handleChange = (index, field, value) => {
    const newQ = [...questions];
    newQ[index][field] = value;
    setQuestions(newQ);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedQuestions = questions.map((q, i) => ({
        questionText: q.questionText || `Question ${i + 1}`,
        questionType: q.questionType || 'short',
        points: Number(q.points) || 1,
        expectedKeywords: q.expectedKeywords ? q.expectedKeywords.split(',').map(k => k.trim()).filter(k => k) : []
      }));

      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/exams`, 
        { title, description, questions: formattedQuestions },
        { headers: { 'x-auth-token': token } }
      );
      
      // Reset form
      setTitle('');
      setDescription('');
      setQuestions([{ questionText: 'Question 1', questionType: 'short', points: 1, expectedKeywords: '' }]);
      
      onExamCreated(res.data);
      onClose();
    } catch (err) {
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 border border-gray-800">
        <div className="sticky top-0 bg-indigo-600 px-6 py-4 flex justify-between items-center z-20">
          <h2 className="text-xl font-bold text-white">Créer un nouvel examen</h2>
          <button 
            onClick={onClose}
            className="text-indigo-200 hover:text-white transition-colors p-1 rounded-full hover:bg-indigo-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4 border-b border-gray-800 pb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Titre de l'examen</label>
              <input 
                type="text" 
                required
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Contrôle de Physique 101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Corrigé type de référence / Sujet (pour guider l'IA)
              </label>
              <textarea 
                required
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 text-sm font-sans"
                value={description} onChange={e => setDescription(e.target.value)}
                rows="6"
                placeholder="Renseignez ici le sujet et/ou le corrigé type détaillé. L'IA l'utilisera comme seule référence pour noter chaque question."
              />
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleSubjectPhotoUpload} 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
              />
              <button
                type="button"
                disabled={generating}
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/20"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyse du sujet par l'IA...
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    Générer depuis un sujet photo
                  </>
                )}
              </button>
              <span className="text-xs text-gray-400 text-center sm:text-left">
                Prenez en photo votre sujet d'examen pour extraire les questions et le barème automatiquement.
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-850 pt-4">
              <div>
                <h3 className="text-lg font-bold text-gray-250">Configuration du barème</h3>
                <p className="text-xs text-gray-500 mt-0.5">Indiquez le nombre de questions et attribuez les points de chacune.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-400">Nombre de questions :</label>
                <input 
                  type="number" 
                  min="1" 
                  max="30"
                  className="w-16 bg-gray-800 border border-gray-700 text-white px-2 py-1 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-indigo-500"
                  value={questions.length} 
                  onChange={e => handleNumQuestionsChange(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-950 p-4 rounded-xl border border-gray-800">
              {questions.map((q, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg flex items-center justify-between gap-1.5 shadow-sm">
                  <span className="text-xs font-semibold text-gray-400 font-mono">Q{i + 1} :</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      required 
                      min="0.5" 
                      step="0.5"
                      className="w-12 bg-gray-950 border border-gray-750 text-white px-1.5 py-0.5 rounded text-xs font-bold text-center focus:ring-1 focus:ring-indigo-500"
                      value={q.points} 
                      onChange={e => handleChange(i, 'points', e.target.value)}
                    />
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">pts</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
              <span>Total du barème : <strong className="text-indigo-400 font-bold">{questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0)} points</strong></span>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-gray-900 pb-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex justify-center items-center py-2.5 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {loading ? 'Création...' : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
