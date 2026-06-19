import React, { useState } from 'react';
import { Plus, Save, Trash2, Loader2, X } from 'lucide-react';
import api from '../api';

const CreateExamModal = ({ isOpen, onClose, onExamCreated }) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', questionType: 'short', points: 1, expectedKeywords: '' }
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', questionType: 'short', points: 1, expectedKeywords: '' }]);
  };

  const handleRemoveQuestion = (index) => {
    const newQ = [...questions];
    newQ.splice(index, 1);
    setQuestions(newQ);
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
      const formattedQuestions = questions.map(q => ({
        ...q,
        points: Number(q.points),
        expectedKeywords: q.expectedKeywords.split(',').map(k => k.trim()).filter(k => k)
      }));

      const res = await api.post('/api/exams', 
        { title, description, questions: formattedQuestions }
      );
      
      // Reset form
      setTitle('');
      setDescription('');
      setQuestions([{ questionText: '', questionType: 'short', points: 1, expectedKeywords: '' }]);
      
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea 
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                value={description} onChange={e => setDescription(e.target.value)}
                rows="2"
                placeholder="Ex: Évaluation sur les lois de Newton"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-200">Questions & Réponses (OCR)</h3>
              <button type="button" onClick={handleAddQuestion} className="text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center transition-colors">
                <Plus className="h-4 w-4 mr-1" /> Ajouter
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="p-5 bg-gray-800/50 rounded-xl border border-gray-700 relative">
                  {questions.length > 1 && (
                    <button type="button" onClick={() => handleRemoveQuestion(i)} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-gray-700">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-8">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Question {i + 1}</label>
                      <input 
                        type="text" required
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg focus:ring-1 focus:ring-indigo-500 placeholder-gray-600"
                        value={q.questionText} onChange={e => handleChange(i, 'questionText', e.target.value)}
                        placeholder="Texte de la question..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
                      <select 
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg focus:ring-1 focus:ring-indigo-500"
                        value={q.questionType} onChange={e => handleChange(i, 'questionType', e.target.value)}
                      >
                        <option value="short">Courte</option>
                        <option value="long">Longue</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Points</label>
                      <input 
                        type="number" required min="1"
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg focus:ring-1 focus:ring-indigo-500"
                        value={q.points} onChange={e => handleChange(i, 'points', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Mots-clés attendus (séparés par des virgules)
                    </label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg focus:ring-1 focus:ring-indigo-500 placeholder-gray-600"
                      value={q.expectedKeywords} 
                      onChange={e => handleChange(i, 'expectedKeywords', e.target.value)}
                      placeholder="Ex: newton, gravité, pomme"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">L'IA cherchera ces mots ou le sens de la réponse pour attribuer les points.</p>
                  </div>
                </div>
              ))}
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
