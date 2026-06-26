// Staffs
import { useState as _useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, MoreHorizontal } from 'lucide-react';
import { staffsApi } from '../../api/services';

const mockStaffs = [
  { id:'1', name:'Jane Doe', email:'janedoe@springhill.com', staff_id:'STF-101', role:'Teacher', subject:'Mathematics', status:'active' as const, joined:'5/27/2023' },
  { id:'2', name:'Bob Marley', email:'bob@springhill.com', staff_id:'STF-102', role:'Teacher', subject:'Physics', status:'active' as const, joined:'1/31/2020' },
  { id:'3', name:'Sarah Johnson', email:'sarahj@springhill.com', staff_id:'STF-103', role:'Teacher', subject:'Chemistry', status:'active' as const, joined:'10/28/2016' },
  { id:'4', name:'Michael Chen', email:'mchen@springhill.com', staff_id:'STF-104', role:'Teacher', subject:'Computer Science', status:'inactive' as const, joined:'8/2/2019' },
];

export function StaffsPage() {
  const { data } = useQuery({ queryKey:['admin-staffs'], queryFn:staffsApi.getAll, placeholderData:mockStaffs as any });
  const staffs: any[] = (data as any[] | undefined) || mockStaffs;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-navy">Staffs</h1>
        <button className="btn-primary text-xs flex items-center gap-1.5"><Plus size={13}/>Add Staff</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Total Staff',mockStaffs.length,'text-primary'],['Active',mockStaffs.filter(s=>s.status==='active').length,'text-green-600'],['Inactive',mockStaffs.filter(s=>s.status==='inactive').length,'text-orange-500'],['Departments','5','text-blue-500']].map(([l,v,c])=>(
          <div key={l as string} className="card p-3"><p className={`text-xl font-bold ${c}`}>{v}</p><p className="text-[11px] text-gray-400 mt-0.5">{l}</p></div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Staff</th>
              <th className="text-left px-4 py-3 font-medium">Staff ID</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Subject</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3"/>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {staffs.map((s:any)=>(
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center text-primary text-[10px] font-bold">{s.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                      <div><p className="font-semibold text-navy">{s.name}</p><p className="text-[10px] text-gray-400">{s.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.staff_id}</td>
                  <td className="px-4 py-3 text-gray-600">{s.role}</td>
                  <td className="px-4 py-3 text-gray-600">{s.subject}</td>
                  <td className="px-4 py-3"><span className={s.status==='active'?'badge-active':'badge-inactive'}>{s.status==='active'?'Active':'Inactive'}</span></td>
                  <td className="px-4 py-3 text-gray-500">{s.joined}</td>
                  <td className="px-4 py-3"><button className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={14} className="text-gray-400"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AcademicsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-navy">Academics</h1>
        <button className="btn-primary text-xs flex items-center gap-1.5"><Plus size={13}/>Add Class</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Total Classes','12','text-primary'],['Total Students','250','text-green-600'],['Subjects','15','text-purple-500'],['Teachers','12','text-blue-500']].map(([l,v,c])=>(
          <div key={l} className="card p-3"><p className={`text-xl font-bold ${c}`}>{v}</p><p className="text-[11px] text-gray-400 mt-0.5">{l}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {['SS 1','SS 2','SS 3','JSS 1','JSS 2','JSS 3'].map((cls,i)=>(
          <div key={cls} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-navy">{cls}</h3>
              <button className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={14} className="text-gray-400"/></button>
            </div>
            <p className="text-xs text-gray-500 mb-2">Subject: Physics</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{80 + i * 5} Students</span>
              <span className="bg-primary-light text-primary px-2 py-0.5 rounded text-[10px] font-medium">Section A</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const mockExams = [
  { id:'1', title:'Mathematics Finals', subject:'Mathematics', class_name:'SS1', mode:'hall_based' as const, section:'Section A,B', schedule:'Jan 15, 2026', duration:90, status:'scheduled' as const },
  { id:'2', title:'Biology Assessment', subject:'Biology', class_name:'SS3', mode:'online' as const, section:'Section B', schedule:'Feb 20, 2026', duration:120, status:'pending_review' as const },
  { id:'3', title:'Physics Quiz', subject:'Physics', class_name:'JSS2', mode:'hall_based' as const, section:'Section A', schedule:'Mar 8, 2026', duration:90, status:'completed' as const },
];

export function ExamsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-navy">Exams</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Total Exams',mockExams.length,'text-primary'],['Pending Review',mockExams.filter(e=>e.status==='pending_review').length,'text-orange-500'],['Scheduled',mockExams.filter(e=>e.status==='scheduled').length,'text-green-600'],['Completed',mockExams.filter(e=>e.status==='completed').length,'text-blue-500']].map(([l,v,c])=>(
          <div key={l as string} className="card p-3"><p className={`text-xl font-bold ${c}`}>{v}</p><p className="text-[11px] text-gray-400 mt-0.5">{l}</p></div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Exam</th>
              <th className="text-left px-4 py-3 font-medium">Class</th>
              <th className="text-left px-4 py-3 font-medium">Mode</th>
              <th className="text-left px-4 py-3 font-medium">Schedule</th>
              <th className="text-left px-4 py-3 font-medium">Duration</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"/>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {mockExams.map(ex=>(
                <tr key={ex.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3"><p className="font-semibold text-navy">{ex.title}</p><p className="text-[10px] text-gray-400">{ex.subject} · {ex.section}</p></td>
                  <td className="px-4 py-3 text-gray-600">{ex.class_name}</td>
                  <td className="px-4 py-3"><span className={ex.mode==='online'?'badge-online':'badge-hallbased'}>{ex.mode==='online'?'Online':'Hall-Based'}</span></td>
                  <td className="px-4 py-3 text-gray-500">{ex.schedule}</td>
                  <td className="px-4 py-3 text-gray-600">{ex.duration} Min</td>
                  <td className="px-4 py-3">
                    <span className={ex.status==='scheduled'?'badge-active':ex.status==='pending_review'?'badge-inactive':'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700'}>{ex.status.replace('_',' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    {ex.status==='pending_review' && <div className="flex gap-1">
                      <button className="text-[10px] bg-primary text-white px-2 py-1 rounded-lg font-medium hover:bg-primary-dark">Approve</button>
                      <button className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg font-medium hover:bg-red-600">Reject</button>
                    </div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AssignmentsPage() {
  const mockAssignments = [
    { id:'1', title:'Quadratic Equations Problem Set', subject:'Mathematics', class_name:'SS1A', teacher:'Dr. Sarah Johnson', description:'Complete problems 1–20 from chapter 5.', deadline:'11th Feb 2026', status:'active', submitted:40, total:45 },
    { id:'2', title:'Binary Search Tree Implementation', subject:'Computer Science', class_name:'SS1B', teacher:'Prof Michael Chen', description:'Implement a balanced BST.', deadline:'10th Feb 2026', status:'submitted', submitted:20, total:35 },
    { id:'3', title:'Chemical Equations', subject:'Chemistry', class_name:'SS1C', teacher:'Mr. Ignecia', description:'Complete problems 1–35 from chapter 5.', deadline:'10th Feb 2026', status:'graded', submitted:35, total:35 },
  ];
  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-navy">Assignments</h1>
      <div className="space-y-3">
        {mockAssignments.map(a=>(
          <div key={a.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-navy">{a.title}</h3>
                  <span className={a.status==='active'?'badge-online':a.status==='graded'?'badge-active':'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700'}>{a.status}</span>
                </div>
                <p className="text-xs text-gray-500">{a.subject} • {a.class_name} • {a.teacher}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 mb-3">{a.description}</div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{a.submitted}/{a.total} Submitted</span>
              <span className="text-xs font-semibold">{Math.round(a.submitted/a.total*100)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2"><div className="bg-primary h-1.5 rounded-full" style={{width:`${Math.round(a.submitted/a.total*100)}%`}}/></div>
            <p className="text-xs text-red-500">Due date: {a.deadline}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const mockResults = [
  { id:'1', title:'Mathematics Finals', class:'SS1 A,B,C', date:'Feb 5, 2026', students:62, avg_score:70, pass_rate:84, highest:95, lowest:40, submissions:'60/62' },
  { id:'2', title:'Biology Second Term', class:'SS2 A,B,C', date:'Feb 6, 2026', students:90, avg_score:64, pass_rate:75, highest:85, lowest:42, submissions:'80/82' },
];

export function ResultsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-navy">Results</h1>
      <div className="space-y-4">
        {mockResults.map(r=>(
          <div key={r.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-navy">{r.title}</h3>
                <p className="text-xs text-gray-400">{r.class} · {r.date} · {r.students} students</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary text-xs py-1.5 px-3">Publish</button>
                <button className="btn-outline text-xs py-1.5 px-3">View</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[['Avg Score',`${r.avg_score}%`],['Pass Rate',`${r.pass_rate}%`],['Highest',`${r.highest}%`],['Lowest',`${r.lowest}%`],['Submissions',r.submissions]].map(([l,v])=>(
                <div key={l} className="border border-gray-100 rounded-xl p-3 text-center">
                  <p className="text-base font-bold text-navy">{v}</p><p className="text-[10px] text-gray-400">{l}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
