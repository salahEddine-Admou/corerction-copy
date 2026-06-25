import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Scan, 
  BookOpen, 
  Sparkles, 
  Download, 
  BarChart3, 
  Users, 
  Check, 
  ChevronRight, 
  MousePointer, 
  PenTool, 
  Crop, 
  Type, 
  MessageSquare,
  Menu,
  X
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleStart = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030014] text-slate-100 overflow-hidden font-sans">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-[20%] left-10 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-[40%] right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none -z-10" style={{ animationDelay: '3s' }}></div>
      <div className="absolute bottom-[20%] left-1/3 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900/60 bg-[#030014]/70 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-2 rounded-xl shadow-md shadow-sky-500/10 group-hover:scale-105 transition-all">
              <Check className="h-5 w-5 text-white stroke-[3.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              Korrect
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-slate-900 border border-slate-805/80 hover:bg-slate-800 transition-all cursor-pointer"
              >
                Tableau de bord <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Connexion
                </Link>
                <button 
                  onClick={handleStart}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 active:scale-95 transition-all cursor-pointer shadow-lg shadow-sky-500/10"
                >
                  Commencer
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-slate-900 bg-[#030014] px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col gap-4 text-sm font-medium text-slate-400">
              <a 
                href="#features" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1"
              >
                Fonctionnalités
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1"
              >
                Comment ça marche
              </a>
              <a 
                href="#pricing" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-white transition-colors py-1"
              >
                Tarifs
              </a>
            </nav>
            <div className="pt-4 border-t border-slate-900 flex flex-col gap-3">
              {isLoggedIn ? (
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full flex justify-center items-center gap-1.5 py-2.5 rounded-xl text-white bg-slate-900 border border-slate-800 text-sm font-semibold"
                >
                  Tableau de bord <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <Link 
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    Connexion
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleStart();
                    }}
                    className="w-full flex justify-center items-center gap-1.5 py-2.5 rounded-xl text-white bg-sky-500 font-semibold text-sm shadow-lg shadow-sky-500/10"
                  >
                    Commencer
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 pt-12 md:pt-20 pb-24 space-y-24 md:space-y-36">

        {/* Hero Section */}
        <section className="text-center space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
          
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5 text-xs font-semibold text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.05)] hover:border-sky-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer select-none">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping"></span>
            ✨ Nouveau - Alignez la correction sur VOTRE corrigé-type
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight font-display">
            Corrigez une pile de copies en <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-sky-300 bg-clip-text text-transparent">moins de temps</span> qu'un café.
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Korrect scanne, transcrit et note vos copies en suivant votre propre corrigé. 
            Vous récupérez les annotations, les statistiques de classe et un PDF prêt à imprimer.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={handleStart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl text-white bg-sky-500 hover:bg-sky-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-sky-500/15 cursor-pointer font-medium"
            >
              Essayer gratuitement
              <ArrowRight className="h-5 w-5 stroke-[2.5]" />
            </button>
            <a 
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-xl text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white hover:bg-white/5 transition-all"
            >
              Voir une démo
            </a>
          </div>
        </section>

        {/* Hero Interactive Review Mockup Showcase */}
        <section id="demo" className="relative max-w-4xl mx-auto pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 rounded-3xl blur-2xl -z-10 opacity-70"></div>
          
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-7 rounded-3xl shadow-[0_0_50px_rgba(56,189,248,0.03)] hover:shadow-[0_0_70px_rgba(56,189,248,0.06)] hover:border-slate-800/90 transition-all duration-500 group">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">
                  <span>Examen</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>Histoire</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                  <span>4e</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Copie de Maya Bernard
                </h3>
              </div>
              
              {/* Final Grade Badge */}
              <div className="self-start sm:self-auto bg-gradient-to-br from-sky-500 to-blue-600 px-4 py-2.5 rounded-2xl text-center shadow-lg shadow-sky-500/10 hover:scale-[1.03] transition-all cursor-default">
                <div className="text-[10px] font-bold text-sky-100 uppercase tracking-wider mb-0.5">Note finale</div>
                <div className="text-2xl font-black text-white font-display">15.5<span className="text-sm font-medium text-sky-200">/20</span></div>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Question 1 */}
              <div className="relative bg-slate-950/60 border border-slate-800/80 hover:border-sky-500/20 hover:bg-slate-950/80 rounded-2xl p-5 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-slate-500">Q1 - Définition</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">
                    Correct
                  </span>
                </div>
                <div className="text-xl font-bold text-white mb-2 font-display">3<span className="text-sm font-medium text-slate-500">/3</span></div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  L'élève a fourni une définition claire et précise des causes de la révolution de 1848, mentionnant la crise économique et sociale.
                </p>
              </div>

              {/* Question 2 (Active editing block) */}
              <div className="relative bg-slate-950/70 border-2 border-sky-500/40 shadow-[0_0_20px_rgba(14,165,233,0.1)] rounded-2xl p-5 transition-all duration-300 scale-[1.02] md:-translate-y-1">
                {/* Floating Correction Editing Toolbar */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900 border border-sky-500/30 px-3 py-1 rounded-full flex items-center gap-2.5 shadow-lg shadow-black/40 z-10">
                  <MousePointer className="h-3 w-3 text-sky-400 cursor-pointer hover:text-sky-300 transition-colors" />
                  <PenTool className="h-3 w-3 text-slate-400 cursor-pointer hover:text-sky-300 transition-colors" />
                  <Crop className="h-3 w-3 text-slate-400 cursor-pointer hover:text-sky-300 transition-colors" />
                  <Type className="h-3 w-3 text-slate-400 cursor-pointer hover:text-sky-300 transition-colors" />
                  <div className="w-px h-3 bg-slate-800"></div>
                  <MessageSquare className="h-3 w-3 text-slate-400 cursor-pointer hover:text-sky-300 transition-colors animate-pulse" />
                </div>

                <div className="flex justify-between items-start mb-3 pt-1">
                  <span className="text-xs font-semibold text-slate-400">Q2 - Analyse</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 uppercase tracking-wider">
                    Partiel
                  </span>
                </div>
                <div className="text-xl font-bold text-white mb-2 font-display">2.5<span className="text-sm font-medium text-slate-500">/4</span></div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  L'analyse de l'impact des banquets républicains est incomplète. Le lien entre l'interdiction du banquet de Paris et l'insurrection est oublié.
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                  <span className="text-[10px] text-sky-400 font-medium">L'IA propose une annotation corrective</span>
                </div>
              </div>

              {/* Question 3 */}
              <div className="relative bg-slate-950/60 border border-slate-800/80 hover:border-sky-500/20 hover:bg-slate-950/80 rounded-2xl p-5 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-slate-500">Q3 - Synthèse</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">
                    Excellent
                  </span>
                </div>
                <div className="text-xl font-bold text-white mb-2 font-display">5<span className="text-sm font-medium text-slate-500">/5</span></div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Structure solide, argumentation équilibrée. Référence pertinente aux sources textuelles et bonne conclusion synthétique.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight font-display">
              Tout pour <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-sky-300 bg-clip-text text-transparent font-black">en finir</span> avec la pile de copies
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Conçu avec et pour les enseignants. Chaque détail compte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="group bg-slate-900/25 border border-slate-850/60 hover:border-slate-700/60 hover:bg-slate-900/40 p-6 sm:p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20 text-sky-400 mb-6 group-hover:scale-105 transition-transform">
                <Scan className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                Scan multi-pages
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Téléversez plusieurs photos d'une même copie. L'IA assemble et transcrit tout le contenu manuscrit de manière fluide.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-slate-900/25 border border-slate-850/60 hover:border-slate-700/60 hover:bg-slate-900/40 p-6 sm:p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20 text-sky-400 mb-6 group-hover:scale-105 transition-transform">
                <BookOpen className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                Aligné sur VOTRE corrigé
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Uploadez votre corrigé type — l'IA s'en inspire directement pour noter selon vos critères spécifiques, pas les siens.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-slate-900/25 border border-slate-850/60 hover:border-slate-700/60 hover:bg-slate-900/40 p-6 sm:p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20 text-sky-400 mb-6 group-hover:scale-105 transition-transform">
                <Sparkles className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                Correction explicable
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Notation rigoureuse et structurée question par question, avec des justifications pédagogiques personnalisées en français.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-slate-900/25 border border-slate-855/60 hover:border-slate-700/60 hover:bg-slate-900/40 p-6 sm:p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20 text-sky-400 mb-6 group-hover:scale-105 transition-transform">
                <Download className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                Export PDF prêt à rendre
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Téléchargez la copie entièrement annotée en PDF de haute qualité, prête à être imprimée ou envoyée directement à l'élève.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-slate-900/25 border border-slate-850/60 hover:border-slate-700/60 hover:bg-slate-900/40 p-6 sm:p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20 text-sky-400 mb-6 group-hover:scale-105 transition-transform">
                <BarChart3 className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                Stats de classe
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Moyenne globale, courbe de distribution et questions les plus manquées : visualisez la performance de votre classe en un clin d'œil.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-slate-900/25 border border-slate-850/60 hover:border-slate-700/60 hover:bg-slate-900/40 p-6 sm:p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1">
              <div className="inline-flex bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20 text-sky-400 mb-6 group-hover:scale-105 transition-transform">
                <Users className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                Élèves & examens
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Annuaire d'élèves complet, bibliothèque d'examens et mots clés attendus. Une organisation simple et tout reste en place.
              </p>
            </div>

          </div>
        </section>

        {/* Steps Section ("3 étapes, c'est tout") */}
        <section id="how-it-works" className="space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight font-display">
              3 étapes, c'est tout
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="relative group p-6 sm:p-8 rounded-3xl bg-slate-900/15 border border-slate-850/30 hover:border-slate-800/60 transition-all duration-300">
              <div className="absolute top-4 right-6 text-7xl sm:text-8xl font-black text-slate-800/10 group-hover:text-sky-500/10 select-none transition-colors duration-300 font-display">
                01
              </div>
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Importez votre corrigé</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Texte ou simple photo de votre barème et réponses attendues — Korrect s'aligne immédiatement sur vos attentes pédagogiques.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group p-6 sm:p-8 rounded-3xl bg-slate-900/15 border border-slate-850/30 hover:border-slate-800/60 transition-all duration-300">
              <div className="absolute top-4 right-6 text-7xl sm:text-8xl font-black text-slate-800/10 group-hover:text-sky-500/10 select-none transition-colors duration-300 font-display">
                02
              </div>
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Scan className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Scannez les copies</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Photos prises avec votre smartphone ou documents PDF compilés, multi-pages supportées. Notre OCR puissant fait le reste.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group p-6 sm:p-8 rounded-3xl bg-slate-900/15 border border-slate-850/30 hover:border-slate-800/60 transition-all duration-300">
              <div className="absolute top-4 right-6 text-7xl sm:text-8xl font-black text-slate-800/10 group-hover:text-sky-500/10 select-none transition-colors duration-300 font-display">
                03
              </div>
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Recevez les notes</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Annotations automatiques, justifications des barèmes sur chaque question et export PDF complet en un clic.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Call to Action Banner Section */}
        <section id="pricing" className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-indigo-500/15 rounded-3xl blur-2xl opacity-60 pointer-events-none"></div>
          
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-sky-500 to-sky-400 p-8 sm:p-12 md:p-16 text-center shadow-2xl shadow-sky-500/10 overflow-hidden">
            {/* Subtle background overlay details */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.15),rgba(255,255,255,0))]"></div>
            
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-display">
                Récupérez vos soirées.
              </h2>
              <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-xl mx-auto">
                Créez un compte gratuit, importez votre première copie et obtenez une correction détaillée en moins d'une minute.
              </p>
              <div className="pt-2">
                <button 
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 hover:bg-slate-900 active:scale-98 text-white rounded-xl text-sm font-semibold tracking-wide shadow-lg shadow-black/20 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Créer mon compte gratuit
                  <ArrowRight className="h-4 w-4 text-sky-400" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-[#030014]/50 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-1.5 rounded-lg">
              <Check className="h-4 w-4 text-white stroke-[3.5]" />
            </div>
            <span className="text-sm font-bold text-white font-display">
              Korrect
            </span>
          </Link>

          {/* Floating dummy correction toolbar design highlight */}
          <div className="bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-full flex items-center gap-4 shadow-lg text-slate-500 scale-90 md:scale-100">
            <MousePointer className="h-4 w-4 hover:text-sky-400 cursor-pointer transition-colors" />
            <PenTool className="h-4 w-4 hover:text-sky-400 cursor-pointer transition-colors" />
            <Crop className="h-4 w-4 hover:text-sky-400 cursor-pointer transition-colors" />
            <Type className="h-4 w-4 hover:text-sky-400 cursor-pointer transition-colors" />
            <div className="w-px h-4 bg-slate-800"></div>
            <MessageSquare className="h-4 w-4 hover:text-sky-400 cursor-pointer transition-colors animate-pulse" />
          </div>

          {/* Copy info */}
          <div className="text-xs text-slate-500">
            © 2026 Korrect. Pensé pour les profs.
          </div>
          
        </div>
      </footer>

    </div>
  );
};

export default Landing;
