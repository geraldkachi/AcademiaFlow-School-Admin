import { useQuery } from '@tanstack/react-query';
import { Users, UserSquare, Clock, BookOpen, Calendar, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

const mockStats = { students: 250, teachers: 12, pending_exams: 20, upcoming_exams: 6, academic_session: '25/26' };
const mockExams = [
  { id:'1', title:'Mid Term Test', subject:'Mathematics', type:'hall_based' as const, date:'30th Jan 2026', time:'9:00AM', duration:120, students:120, class_name:'SS1' },
  { id:'2', title:'Second Term Exam', subject:'Chemistry', type:'hall_based' as const, date:'30th Jan 2026', time:'9:00AM', duration:120, students:120, class_name:'SS2' },
];
const mockResults = [
  { id:'1', title:'Mathematics Mid Term Test – SS3', type:'online', avg_score:78, pass_rate:80, students:120 },
  { id:'2', title:'Biology Second Term Exams – SS2', type:'hall_based', avg_score:62, pass_rate:29, students:120 },
];
const mockActivities = [
  { id:'1', title:'New Exam Created', description:'Mathematics. Pending Approval\n4:35 PM', type:'success' as const },
  { id:'2', title:'Physics Test scheduled', description:'Test coming up on Friday 30th\n2:00 PM', type:'info' as const },
  { id:'3', title:'English Exam Graded', description:'Results are now available\n11:10 PM', type:'success' as const },
  { id:'4', title:'Biology Assignment Deadline', description:'Deadline in 3 hours\n2:00 PM', type:'error' as const },
];
const ActivityIcon = ({ type }: { type: string }) => {
  if (type === 'success') return <CheckCircle2 className="w-5 h-5 text-primary shrink-0"/>;
  if (type === 'error') return <AlertCircle className="w-5 h-5 text-red-500 shrink-0"/>;
  return <Info className="w-5 h-5 text-blue-400 shrink-0"/>;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: dashboardApi.getStats, placeholderData: mockStats });
  const s = (stats as any) || mockStats;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-navy">Hello, {user?.name || 'Admin 1'}</h1>
        <p className="text-xs text-gray-400">What do you want to do today?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Students', value: s.students, icon: Users, color: 'text-green-600' },
          { label: 'Teachers', value: s.teachers, icon: UserSquare, color: 'text-purple-600' },
          { label: 'Pending Exams', value: s.pending_exams, icon: Clock, color: 'text-orange-500' },
          { label: 'Upcoming Exams', value: s.upcoming_exams, icon: BookOpen, color: 'text-teal-500' },
          { label: 'Academic Session', value: s.academic_session, icon: Calendar, color: 'text-blue-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-3">
            <Icon size={16} className={`${color} mb-2`}/>
            <p className="text-xl font-bold text-navy">{value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Exams */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-navy">Upcoming Exam</h3>
            </div>
            <div className="p-4 space-y-3">
              {mockExams.map(ex => (
                <div key={ex.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-primary">{ex.title}</h4>
                    <span className={(ex as any).examType !== 'online' ? 'badge-hallbased' : 'badge-online'}>{(ex as any).examType !== 'online' ? 'Hall Based' : 'Online'}</span>
                  </div>
                  <p className="text-xs text-primary font-medium mb-3">{ex.subject}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-gray-500">
                    <div><span className="block text-gray-400">📅 Date</span><span className="font-medium text-navy">{ex.date}</span></div>
                    <div><span className="block text-gray-400">⏰ Time</span><span className="font-medium text-navy">{ex.time}</span></div>
                    <div><span className="block text-gray-400">⏱ Duration</span><span className="font-medium text-navy">{ex.duration} Minutes</span></div>
                    <div><span className="block text-gray-400">👥 Students</span><span className="font-medium text-navy">{ex.students}</span></div>
                    <div><span className="block text-gray-400">🏫 Class</span><span className="font-medium text-navy">{ex.class_name}</span></div>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/exams')} className="text-primary text-xs font-semibold hover:underline w-full text-center">View All</button>
            </div>
          </div>

          {/* Recent Results */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-navy">Recent Results</h3>
            </div>
            <div className="p-4 space-y-3">
              {mockResults.map(r => (
                <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-navy text-sm">{r.title}</h4>
                    <span className={r.type === 'online' ? 'badge-online' : 'badge-hallbased'}>{r.type === 'online' ? 'Online' : 'Hall Based'}</span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span>Average Score: <span className="font-bold text-primary">{r.avg_score}%</span></span>
                    <span>Pass Rate: <span className={`font-bold ${r.pass_rate < 50 ? 'text-red-500' : 'text-primary'}`}>{r.pass_rate}%</span></span>
                    <span>Students: <span className="font-bold text-navy">{r.students}</span></span>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/results')} className="text-primary text-xs font-semibold hover:underline w-full text-center">View All</button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card p-4">
            <h3 className="text-sm font-bold text-navy mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Add Student', path: '/students' },
                { label: 'Add Teacher', path: '/staffs' },
                { label: 'Create Exam', path: '/exams' },
                { label: 'View Result', path: '/results' },
              ].map(({ label, path }) => (
                <button key={label} onClick={() => navigate(path)}
                  className="bg-gray-50 hover:bg-primary-light hover:text-primary text-gray-600 rounded-xl py-3 px-2 text-xs font-semibold transition-colors border border-gray-100 leading-tight">
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Recent Activities */}
          <div className="card p-4">
            <h3 className="text-sm font-bold text-navy mb-3">Recent Activities</h3>
            <div className="space-y-3">
              {mockActivities.map(a => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <ActivityIcon type={a.type}/>
                  <div>
                    <p className="text-xs font-semibold text-navy leading-tight">{a.title}</p>
                    <p className="text-[10px] text-gray-400 whitespace-pre-line">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
