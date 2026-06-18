import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Save, Trash2, Loader2 } from 'lucide-react';

const CreateExam = () => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', questionType: 'short', points: 1, expectedKeywords: '' }
  ]);
  const navigate = useNavigate();

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

      const token = localStorage.getItem('token');
      await axios.post('https://coorection-copy-server.vercel.app/api/exams', 
        { title, description, questions: formattedQuestions },
        { headers: { 'x-auth-token': token } }
      );
      navigate('/dashboard');
    } catch (err) {
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Créer un nouvel examen</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4 border-b pb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Titre de l'examen</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Contrôle de Physique 101"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={description} onChange={e => setDescription(e.target.value)}
                  rows="2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Questions & Réponses (OCR)</h3>
                <button type="button" onClick={handleAddQuestion} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full text-sm font-medium flex items-center transition-colors">
                  <Plus className="h-4 w-4 mr-1" /> Ajouter Question
                </button>
              </div>

              {questions.map((q, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                  {questions.length > 1 && (
                    <button type="button" onClick={() => handleRemoveQuestion(i)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                    <div className="md:col-span-8">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Question {i + 1}</label>
                      <input 
                        type="text" required
                        className="w-full px-3 py-2 border rounded-md"
                        value={q.questionText} onChange={e => handleChange(i, 'questionText', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
                      <select 
                        className="w-full px-3 py-2 border rounded-md"
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
                        className="w-full px-3 py-2 border rounded-md"
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
                      className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500"
                      value={q.expectedKeywords} 
                      onChange={e => handleChange(i, 'expectedKeywords', e.target.value)}
                      placeholder="Ex: newton, gravité, pomme"
                    />
                    <p className="text-xs text-gray-400 mt-1">L'OCR cherchera ces mots pour attribuer les points.</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-6 w-6 mr-2 animate-spin" /> : <Save className="h-6 w-6 mr-2" />}
                {loading ? 'Création en cours...' : "Enregistrer l'Examen"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
