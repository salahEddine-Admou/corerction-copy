import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Plus, FileText, Users, Loader2, ScanLine, Trash2, Edit2, X, Check, UserPlus, LayoutDashboard, GraduationCap, Menu, ChevronLeft } from 'lucide-react';
import CreateExamModal from '../components/CreateExamModal';

const API = 'http://localhost:5000';

const Dashboard = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCreateExamModalOpen, setIsCreateExamModalOpen] = useState(false);
  const navigate = useNavigate();

  // Student form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', matricule: '', className: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ firstName: '', lastName: '', matricule: '', className: '' });
  const [studentLoading, setStudentLoading] = useState(false);

  const getHeaders = () => ({ 'x-auth-token': localStorage.getItem('token') });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const headers = { 'x-auth-token': token };
        setLoading(true);
        const [examsRes, studentsRes] = await Promise.all([
          axios.get(`${API}/api/exams`, { headers }),
          axios.get(`${API}/api/students`, { headers })
        ]);
        setExams(examsRes.data);
        setStudents(studentsRes.data);
      } catch (err) {
        if (err.response?.status === 401) handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // === Student CRUD ===
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setStudentLoading(true);
    try {
      const res = await axios.post(`${API}/api/students`, newStudent, { headers: getHeaders() });
      setStudents([res.data, ...students]);
      setNewStudent({ firstName: '', lastName: '', matricule: '', className: '' });
      setShowAddForm(false);
    } catch (err) {
      alert(err.response?.data?.msg || 'Erreur lors de l\'ajout');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Supprimer cet élève ?')) return;
    try {
      await axios.delete(`${API}/api/students/${id}`, { headers: getHeaders() });
      setStudents(students.filter(s => s._id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const startEdit = (student) => {
    setEditingId(student._id);
    setEditData({ firstName: student.firstName, lastName: student.lastName, matricule: student.matricule, className: student.className });
  };

  const handleEditStudent = async () => {
    setStudentLoading(true);
    try {
      const res = await axios.put(`${API}/api/students/${editingId}`, editData, { headers: getHeaders() });
      setStudents(students.map(s => s._id === editingId ? res.data : s));
      setEditingId(null);
    } catch (err) {
      alert('Erreur lors de la modification');
    } finally {
      setStudentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mb-4" />
        <p className="text-gray-400 font-medium text-lg">Chargement de vos données...</p>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'scan', label: 'Scanner une copie', icon: ScanLine },
    { id: 'exams', label: 'Mes Examens', icon: FileText },
    { id: 'students', label: 'Mes Élèves', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 fixed h-full z-20`}>
        {/* Logo */}
        <div className={`p-5 border-b border-gray-800 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">EduGrade</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-800">
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => item.id === 'scan' ? navigate('/scan-copy') : setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-indigo-600/20 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                }
                ${!sidebarOpen ? 'justify-center' : ''}
              `}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${activeTab === item.id ? 'text-indigo-400' : ''}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Stats badges */}
        {sidebarOpen && (
          <div className="p-4 mx-3 mb-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Examens</span>
              <span className="text-indigo-400 font-bold">{exams.length}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Élèves</span>
              <span className="text-green-400 font-bold">{students.length}</span>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top bar */}
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              {activeTab === 'overview' && '📊 Vue d\'ensemble'}
              {activeTab === 'exams' && '📝 Mes Examens'}
              {activeTab === 'students' && '👥 Mes Élèves'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'overview' && 'Bienvenue sur votre tableau de bord'}
              {activeTab === 'exams' && `${exams.length} examen(s) créé(s)`}
              {activeTab === 'students' && `${students.length} élève(s) inscrit(s)`}
            </p>
          </div>
        </header>

        <div className="p-6">
          {/* === OVERVIEW TAB === */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Scanner CTA */}
              <Link to="/scan-copy" className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-indigo-500/20 transition-all hover:scale-[1.01] border border-indigo-500/30">
                <div className="flex items-center">
                  <ScanLine className="h-10 w-10 mr-4" />
                  <div>
                    <h2 className="text-xl font-bold">📄 Scanner une copie</h2>
                    <p className="text-indigo-200 text-sm mt-1">L'IA identifie l'élève, l'examen et corrige automatiquement</p>
                  </div>
                </div>
              </Link>

              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Examens</p>
                      <p className="text-3xl font-bold text-white mt-1">{exams.length}</p>
                    </div>
                    <FileText className="h-10 w-10 text-indigo-500/30" />
                  </div>
                </div>
                <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Élèves</p>
                      <p className="text-3xl font-bold text-white mt-1">{students.length}</p>
                    </div>
                    <Users className="h-10 w-10 text-green-500/30" />
                  </div>
                </div>
                <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Questions</p>
                      <p className="text-3xl font-bold text-white mt-1">{exams.reduce((acc, e) => acc + (e.questions?.length || 0), 0)}</p>
                    </div>
                    <GraduationCap className="h-10 w-10 text-purple-500/30" />
                  </div>
                </div>
              </div>

              {/* Quick lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Exams */}
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center"><FileText className="mr-2 h-5 w-5 text-indigo-400" /> Derniers Examens</h3>
                    <button onClick={() => setActiveTab('exams')} className="text-xs text-indigo-400 hover:text-indigo-300">Voir tout →</button>
                  </div>
                  {exams.slice(0, 3).map(exam => (
                    <div key={exam._id} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-200">{exam.title}</p>
                        <p className="text-xs text-gray-600">{new Date(exam.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">{exam.questions?.length || 0}q</span>
                    </div>
                  ))}
                </div>

                {/* Recent Students */}
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center"><Users className="mr-2 h-5 w-5 text-green-400" /> Derniers Élèves</h3>
                    <button onClick={() => setActiveTab('students')} className="text-xs text-green-400 hover:text-green-300">Voir tout →</button>
                  </div>
                  {students.slice(0, 4).map(student => (
                    <div key={student._id} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
                      <p className="text-sm font-medium text-gray-200">{student.firstName} {student.lastName}</p>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{student.className}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === EXAMS TAB === */}
          {activeTab === 'exams' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsCreateExamModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 flex items-center transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="h-4 w-4 mr-2"/> Nouvel Examen
                </button>
              </div>
              {exams.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun examen créé pour le moment.</p>
                  <button onClick={() => setIsCreateExamModalOpen(true)} className="text-indigo-400 text-sm hover:underline mt-2 inline-block">Créer votre premier examen →</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exams.map(exam => (
                    <div key={exam._id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-indigo-500/30 transition-all group">
                      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 px-5 py-4">
                        <h3 className="font-bold text-white text-lg">{exam.title}</h3>
                        {exam.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{exam.description}</p>}
                      </div>
                      <div className="px-5 py-4">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                          <span>{exam.questions?.length || 0} questions</span>
                          <span>{exam.totalPoints} pts</span>
                          <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Link to={`/grade-exam/${exam._id}`} className="block text-center text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition-colors">
                          Corriger
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === STUDENTS TAB === */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 flex items-center transition-colors shadow-lg shadow-green-500/20"
                >
                  {showAddForm ? <X className="h-4 w-4 mr-2"/> : <UserPlus className="h-4 w-4 mr-2"/>}
                  {showAddForm ? 'Annuler' : 'Ajouter un élève'}
                </button>
              </div>

              {/* Add form */}
              {showAddForm && (
                <form onSubmit={handleAddStudent} className="bg-gray-900 p-5 rounded-2xl border border-green-500/30 space-y-3">
                  <h4 className="text-white font-medium mb-2">Nouvel élève</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" required placeholder="Prénom"
                      className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                      value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} />
                    <input type="text" required placeholder="Nom"
                      className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                      value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" required placeholder="Matricule"
                      className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                      value={newStudent.matricule} onChange={e => setNewStudent({...newStudent, matricule: e.target.value})} />
                    <input type="text" required placeholder="Classe (ex: Terminale S)"
                      className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder-gray-500"
                      value={newStudent.className} onChange={e => setNewStudent({...newStudent, className: e.target.value})} />
                  </div>
                  <button type="submit" disabled={studentLoading}
                    className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                    {studentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Ajouter l'élève
                  </button>
                </form>
              )}

              {students.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun élève inscrit.</p>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          {editingId === student._id ? (
                            <>
                              <td className="px-5 py-3">
                                <div className="flex gap-2">
                                  <input type="text" value={editData.firstName} className="bg-gray-800 border border-gray-600 text-white px-2 py-1 rounded text-sm w-24" onChange={e => setEditData({...editData, firstName: e.target.value})} />
                                  <input type="text" value={editData.lastName} className="bg-gray-800 border border-gray-600 text-white px-2 py-1 rounded text-sm w-24" onChange={e => setEditData({...editData, lastName: e.target.value})} />
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <input type="text" value={editData.matricule} className="bg-gray-800 border border-gray-600 text-white px-2 py-1 rounded text-sm w-28" onChange={e => setEditData({...editData, matricule: e.target.value})} />
                              </td>
                              <td className="px-5 py-3">
                                <input type="text" value={editData.className} className="bg-gray-800 border border-gray-600 text-white px-2 py-1 rounded text-sm w-28" onChange={e => setEditData({...editData, className: e.target.value})} />
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-800"><X className="h-4 w-4" /></button>
                                  <button onClick={handleEditStudent} className="text-green-500 hover:text-green-300 p-1.5 rounded-lg hover:bg-gray-800"><Check className="h-4 w-4" /></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-3">
                                <span className="font-medium text-gray-200">{student.firstName} {student.lastName}</span>
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-sm text-gray-400 font-mono">{student.matricule}</span>
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full border border-gray-700">{student.className}</span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <button onClick={() => startEdit(student)} className="text-gray-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><Edit2 className="h-4 w-4" /></button>
                                  <button onClick={() => handleDeleteStudent(student._id)} className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateExamModal 
        isOpen={isCreateExamModalOpen} 
        onClose={() => setIsCreateExamModalOpen(false)} 
        onExamCreated={(newExam) => {
          setExams([newExam, ...exams]);
          setActiveTab('exams');
        }}
      />
    </div>
  );
};

export default Dashboard;
