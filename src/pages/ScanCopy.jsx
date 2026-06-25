import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import {
  Sparkles,
  BookOpen,
  Plus,
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  AlertTriangle,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import AppLayout from '../components/AppLayout';
import { API_URL } from '../config';

const MAX_PAGES = 10;

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename, { type: mime });
};

const ScanCopy = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const corrigéInputRef = useRef(null);
  const webcamRef = useRef(null);

  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [gradeScale, setGradeScale] = useState('20');

  const [corrigéFile, setCorrigéFile] = useState(null);
  const [corrigéPreview, setCorrigéPreview] = useState(null);
  const [showCorrigé, setShowCorrigé] = useState(false);

  const [pages, setPages] = useState([]);
  const [useCamera, setUseCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [conflictData, setConflictData] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('new');
  const [customInstructions, setCustomInstructions] = useState('');

  const getHeaders = () => ({ 'x-auth-token': localStorage.getItem('token') });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const headers = getHeaders();
        const [examsRes, studentsRes] = await Promise.all([
          axios.get(`${API_URL}/api/exams`, { headers }),
          axios.get(`${API_URL}/api/students`, { headers }),
        ]);
        setExams(examsRes.data);
        setStudents(studentsRes.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (selectedExamId) {
      const exam = exams.find(e => e._id === selectedExamId);
      if (exam?.totalPoints) setGradeScale(String(exam.totalPoints));
    }
  }, [selectedExamId, exams]);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (!incoming.length) return;

    setPages(prev => {
      const remaining = MAX_PAGES - prev.length;
      const toAdd = incoming.slice(0, remaining).map((file, i) => ({
        id: `${Date.now()}-${i}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...prev, ...toAdd];
    });
    setError(null);
    setResult(null);
    setUseCamera(false);
  };

  const removePage = (id) => {
    setPages(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter(p => p.id !== id);
    });
  };

  const clearPages = () => {
    pages.forEach(p => URL.revokeObjectURL(p.preview));
    setPages([]);
    setResult(null);
    setError(null);
  };

  const handleCorrigéChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCorrigéFile(file);
    setCorrigéPreview(URL.createObjectURL(file));
    setShowCorrigé(true);
  };

  const removeCorrigé = () => {
    if (corrigéPreview) URL.revokeObjectURL(corrigéPreview);
    setCorrigéFile(null);
    setCorrigéPreview(null);
    setShowCorrigé(false);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;
    const file = dataURLtoFile(imageSrc, `capture_${Date.now()}.jpg`);
    addFiles([file]);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleResolveConflict = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      let res;
      if (selectedVersion === 'new') {
        res = await axios.post(`${API_URL}/api/submissions/confirm-new`, {
          submissionData: conflictData.unsavedSubmission,
        }, { headers });
      } else {
        res = await axios.put(`${API_URL}/api/submissions/replace/${selectedVersion}`, {
          submissionData: conflictData.unsavedSubmission,
        }, { headers });
      }
      setResult({
        ...res.data,
        examTitle: conflictData.enrichedResult.examTitle,
        studentName: conflictData.enrichedResult.studentName,
        totalPoints: conflictData.enrichedResult.totalPoints,
      });
      setConflictData(null);
    } catch {
      setError({ msg: 'Erreur lors de la résolution du conflit.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!pages.length) {
      setError({ msg: 'Veuillez ajouter au moins une image de la copie.' });
      return;
    }

    const formData = new FormData();
    formData.append('scannedImage', pages[0].file);
    if (selectedExamId) formData.append('examId', selectedExamId);
    if (selectedStudentId) formData.append('studentId', selectedStudentId);
    if (customInstructions) formData.append('customInstructions', customInstructions);

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(`${API_URL}/api/submissions/scan`, formData, {
        headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.conflict) {
        setConflictData(res.data);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data || { msg: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0f1e]">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-sky-400" />
        <p className="text-slate-400">Chargement...</p>
      </div>
    );
  }

  return (
    <AppLayout
      activeNav="scan"
      title="Scanner une copie"
      backLink={{ to: '/dashboard', label: 'Dashboard' }}
    >
      <form onSubmit={handleUpload} className="mx-auto max-w-3xl space-y-4">
        {/* Info card */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/80 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15">
              <Sparkles className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Correction intelligente</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                L&apos;IA transcrit la copie, identifie l&apos;élève et note chaque question selon votre corrigé.
              </p>
            </div>
          </div>
        </div>

        {/* Corrigé */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/80">
          <div className="flex w-full items-center justify-between p-5">
            <button
              type="button"
              onClick={() => setShowCorrigé(!showCorrigé)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <BookOpen className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-white">
                  Votre corrigé <span className="font-normal text-slate-500">(optionnel mais recommandé)</span>
                </p>
                <p className="text-xs text-slate-500">Aidez l&apos;IA à noter selon vos attentes.</p>
              </div>
            </button>
            {corrigéPreview ? (
              <button
                type="button"
                onClick={removeCorrigé}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => corrigéInputRef.current?.click()}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-sky-400"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
          <input ref={corrigéInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleCorrigéChange} />
          {(showCorrigé || corrigéPreview) && (
            <div className="border-t border-slate-800/80 px-5 pb-5">
              {corrigéPreview ? (
                <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  {corrigéFile?.type.startsWith('image/') ? (
                    <img src={corrigéPreview} alt="Corrigé" className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-800">
                      <FileText className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{corrigéFile?.name}</p>
                    <p className="text-xs text-slate-500">Référence pour la correction</p>
                  </div>
                </div>
              ) : (
                <label className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-6 transition-colors hover:border-sky-500/40 hover:bg-slate-950/70">
                  <Upload className="mb-2 h-6 w-6 text-slate-500" />
                  <span className="text-sm text-slate-400">Ajouter votre corrigé</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleCorrigéChange} />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800/80 bg-[#111827]/80 p-5 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">
              Examen <span className="text-slate-600">(optionnel)</span>
            </label>
            <div className="relative">
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 py-2.5 pr-9 text-sm text-white focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">— Détection auto —</option>
                {exams.map(exam => (
                  <option key={exam._id} value={exam._id}>{exam.title}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">
              Élève <span className="text-slate-600">(optionnel)</span>
            </label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 py-2.5 pr-9 text-sm text-white focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">— Détection auto —</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">Note sur</label>
            <input
              type="number"
              min="1"
              max="100"
              value={gradeScale}
              onChange={(e) => setGradeScale(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        {/* Custom Instructions for AI Grader */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/80 p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-5 w-5 text-sky-400" />
            <h3 className="font-semibold text-white text-sm">Consignes de correction pour l&apos;IA</h3>
          </div>
          <p className="text-xs text-slate-500">
            Donnez des conseils ou consignes de notation particuliers (ex: &ldquo;Note très sévèrement&rdquo;, &ldquo;Valorise l&apos;esprit critique et de synthèse&rdquo;, etc.).
          </p>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Ex: Note sévèrement les réponses incomplètes et pénalise le manque de précision historique."
            rows="2"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 p-3 text-sm text-white placeholder-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all resize-none"
          />
        </div>

        {/* Student copy upload */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="h-5 w-5 text-sky-400" />
              <h3 className="font-semibold text-white">Copie de l&apos;élève</h3>
            </div>
            {!pages.length && (
              <div className="flex rounded-lg border border-slate-700/80 bg-slate-950/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setUseCamera(false)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${!useCamera ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <ImageIcon className="h-3.5 w-3.5" /> Fichier
                </button>
                <button
                  type="button"
                  onClick={() => setUseCamera(true)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${useCamera ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Camera className="h-3.5 w-3.5" /> Caméra
                </button>
              </div>
            )}
          </div>

          {pages.length > 0 ? (
            <div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {pages.map((page, idx) => (
                  <div key={page.id} className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
                    <img src={page.preview} alt={`Page ${idx + 1}`} className="aspect-[3/4] w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
                      <span className="text-xs font-medium text-white">Page {idx + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePage(page.id)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {pages.length < MAX_PAGES && (
                  <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/30 transition-colors hover:border-sky-500/40 hover:bg-slate-950/60">
                    <Plus className="mb-1 h-6 w-6 text-slate-500" />
                    <span className="text-xs text-slate-500">Ajouter</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
                  </label>
                )}
              </div>
              <button type="button" onClick={clearPages} className="mt-3 text-xs font-medium text-red-400 hover:text-red-300">
                Tout supprimer
              </button>
              {pages.length > 1 && (
                <p className="mt-2 text-xs text-slate-500">
                  {pages.length} pages sélectionnées — la première page sera analysée par l&apos;IA.
                </p>
              )}
            </div>
          ) : useCamera ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-12 text-center">
              <Camera className="mb-3 h-8 w-8 text-sky-400 animate-pulse" />
              <p className="text-sm font-medium text-slate-300 mb-4">Utiliser l&apos;appareil photo de votre téléphone</p>
              <button
                type="button"
                onClick={() => document.getElementById('native-camera-input')?.click()}
                className="flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 active:scale-95 cursor-pointer"
              >
                <Camera className="h-4 w-4" /> Activer l&apos;appareil photo
              </button>
              <input
                id="native-camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    addFiles(e.target.files);
                  }
                  e.target.value = '';
                }}
              />
            </div>
          ) : (
            <label
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 transition-all hover:border-sky-500/40 hover:bg-slate-950/70"
            >
              <Upload className="mb-3 h-8 w-8 text-slate-500" />
              <p className="text-sm font-medium text-slate-300">Cliquez ou glissez des images</p>
              <p className="mt-1.5 text-xs text-slate-500">Multi-pages · PNG ou JPG · jusqu&apos;à {MAX_PAGES}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !pages.length}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 py-4 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyse IA en cours...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Lancer la correction intelligente
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div className="min-w-0">
                <h3 className="font-semibold text-red-400">{error.msg}</h3>
                {error.extractedData && (
                  <div className="mt-3 space-y-1 text-sm text-slate-300">
                    <p>Examen détecté : <strong>{error.extractedData.examTitle || 'Non identifié'}</strong></p>
                    <p>Élève détecté : <strong>{error.extractedData.studentName || 'Non identifié'}</strong></p>
                  </div>
                )}
                {error.availableExams?.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-xs text-red-300/80">
                    {error.availableExams.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
                {error.availableStudents?.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-xs text-red-300/80">
                    {error.availableStudents.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/80 p-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/15 p-2.5">
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Correction terminée</h3>
                  <p className="text-xs text-slate-500">Évaluée avec succès par l&apos;IA</p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-5 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Note</p>
                <p className="text-2xl font-black text-emerald-400">
                  {result.totalScore}
                  <span className="text-sm font-semibold text-slate-500"> / {result.totalPoints || gradeScale}</span>
                </p>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
                <User className="h-4 w-4 text-sky-400" /> {result.studentName}
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300">
                <BookOpen className="h-4 w-4 text-violet-400" /> {result.examTitle}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Détail par question</p>
              {result.answers?.map((ans, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="font-semibold text-white">Question {i + 1}</span>
                    <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold ${ans.isCorrect ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-orange-500/20 bg-orange-500/10 text-orange-400'}`}>
                      {ans.score} pts
                    </span>
                  </div>
                  <p className="rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-sm italic text-slate-400">
                    &ldquo;{ans.extractedText}&rdquo;
                  </p>
                  {ans.justification && (
                    <p className="mt-2 rounded-lg border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-300">
                      <strong>IA :</strong> {ans.justification}
                    </p>
                  )}
                  {(ans.plagiarismRisk === 'medium' || ans.plagiarismRisk === 'high') && (
                    <div className={`mt-2 flex items-start gap-2 rounded-lg border p-3 text-xs ${ans.plagiarismRisk === 'high' ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-orange-500/20 bg-orange-500/10 text-orange-400'}`}>
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{ans.plagiarismDetails}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Conflict modal */}
      {conflictData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-800 bg-orange-500/10 px-6 py-4">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <h3 className="font-bold text-orange-400">Copies multiples détectées</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-sm text-slate-300">
                <strong>{conflictData.enrichedResult.studentName}</strong> a déjà rendu{' '}
                {conflictData.existingSubmissions.length} copie(s) pour{' '}
                <strong>{conflictData.enrichedResult.examTitle}</strong>.
              </p>
              <div className="mb-6 space-y-2">
                <label className={`block cursor-pointer rounded-xl border p-4 transition-all ${selectedVersion === 'new' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:bg-slate-900'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="version" checked={selectedVersion === 'new'} onChange={() => setSelectedVersion('new')} className="text-sky-500" />
                    <span className="text-sm font-semibold text-white">Ajouter comme nouvelle version</span>
                  </div>
                </label>
                {conflictData.existingSubmissions.map((sub, idx) => (
                  <label key={sub._id} className={`block cursor-pointer rounded-xl border p-4 transition-all ${selectedVersion === sub._id ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:bg-slate-900'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="version" checked={selectedVersion === sub._id} onChange={() => setSelectedVersion(sub._id)} className="text-sky-500" />
                      <div>
                        <span className="text-sm font-semibold text-white">Remplacer la copie #{idx + 1}</span>
                        <p className="text-xs text-slate-500">{sub.totalScore} pts · {new Date(sub.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button type="button" onClick={() => setConflictData(null)} className="rounded-xl px-4 py-2 text-sm text-slate-400 hover:text-white">
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleResolveConflict}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ScanCopy;
