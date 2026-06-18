import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Plus, FileText, Users, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const headers = { 'x-auth-token': token };
        
        setLoading(true);
        const [examsRes, studentsRes] = await Promise.all([
          axios.get('https://coorection-copy-server.vercel.app/api/exams', { headers }),
          axios.get('https://coorection-copy-server.vercel.app/api/students', { headers })
        ]);
        
        setExams(examsRes.data);
        setStudents(studentsRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          handleLogout();
        }
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium text-lg">Chargement de vos données...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">EduGrade OCR</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-1" /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section Examens */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center"><FileText className="mr-2 text-indigo-500" /> Mes Examens</h2>
              <Link to="/create-exam" className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-indigo-100 flex items-center transition-colors">
                <Plus className="h-4 w-4 mr-1"/> Nouveau
              </Link>
            </div>
            {exams.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Aucun examen créé.</p>
            ) : (
              <ul className="space-y-3">
                {exams.map(exam => (
                  <li key={exam._id} className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{exam.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{new Date(exam.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Link to={`/grade-exam/${exam._id}`} className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">
                        Corriger
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Section Élèves */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center"><Users className="mr-2 text-green-500" /> Mes Élèves</h2>
            </div>
            {students.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Aucun élève inscrit. <br/>(Simulez l'ajout via l'API pour l'instant)</p>
            ) : (
              <ul className="space-y-3">
                {students.map(student => (
                  <li key={student._id} className="p-3 rounded-xl bg-gray-50 flex justify-between">
                    <span className="font-medium text-gray-700">{student.firstName} {student.lastName}</span>
                    <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded border">{student.className}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
