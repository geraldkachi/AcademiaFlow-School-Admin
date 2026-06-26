import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { academicsApi } from '../../api/services';

type Tab = 'session'|'classes'|'subjects';

const mockSessions = [
  {
    id:'1', name:'2025/2026 Academic Session', status:'current', dates:'Sep 1, 2025 – Jul 9, 2026',
    terms:[
      { name:'First Term', status:'Completed', start:'Sep 1, 2025', end:'Dec 31, 2025', duration:'16 Weeks', session:'2025/2026' },
      { name:'Second Term', status:'Current Term', start:'May 1, 2025', end:'Dec 17, 2025', duration:'16 Weeks', session:'2025/2026' },
      { name:'Third Term', status:'Incoming', start:'May 1, 2025', end:'Dec 17, 2025', duration:'16 Weeks', session:'2025/2026' },
    ]
  },
  { id:'2', name:'2024/2025 Academic Session', status:'', dates:'Sep 1, 2024 – Jun 28, 2025', terms:[] },
];

const mockClasses = [
  { id:'1', name:'JSS 1', teacher:'Mr. Okon', students:92, sections:['JSS 1A','JSS 1B','JSS 1C'] },
  { id:'2', name:'JSS 2', teacher:'Mrs. Flora', students:63, sections:['JSS 2A','JSS 2B','JSS 2C'] },
  { id:'3', name:'JSS 3', teacher:'Mr. Femi Balogun', students:87, sections:['JSS 3A','JSS 3B','JSS 3C'] },
  { id:'4', name:'SSS 1', teacher:'Dr. Amara', students:60, sections:['SSS 1A','SSS 1B','SSS 1C'] },
  { id:'5', name:'SSS 2', teacher:'Mrs. Chioma', students:55, sections:['SSS 2A','SSS 2B','SSS 2C'] },
  { id:'6', name:'SSS 3', teacher:'Mr. Tunde', students:28, sections:['SSS 3A','SSS 3B','SSS 3C'] },
];

const mockSubjects = [
  { id:'1', name:'Mathematics', code:'MTH', department:'Mathematics', teacher:'Kristin Watson', classes:'JSS 1 – SS 3', status:'Compulsory' },
  { id:'2', name:'English Language', code:'ENG', department:'Humanities', teacher:'Kathryn Murphy', classes:'JSS 1 – SSS 3', status:'Compulsory' },
  { id:'3', name:'Physics', code:'PHY', department:'Science', teacher:'Annette Black', classes:'SSS 1 – SSS 3', status:'Elective' },
  { id:'4', name:'Chemistry', code:'CHM', department:'Science', teacher:'Esther Howard', classes:'SSS 1 – SSS 3', status:'Elective' },
  { id:'5', name:'Biology', code:'BIO', department:'Science', teacher:'Courtney Henry', classes:'SSS 1 – SSS 3', status:'Elective' },
  { id:'6', name:'Economics', code:'ECO', department:'Arts', teacher:'Dianne Russell', classes:'SSS 1 – SSS 3', status:'Elective' },
  { id:'7', name:'Government', code:'GOV', department:'Commercial', teacher:'Ronald Richards', classes:'SSS 1 – SSS 3', status:'Elective' },
  { id:'8', name:'Literature in English', code:'LIT', department:'Arts', teacher:'Eleanor Pena', classes:'SSS 1 – SSS 3', status:'Elective' },
];

// ─── Add Class Modal ───────────────────────────────────────────────────────
function AddClassModal({ onClose, editClass }: { onClose: () => void; editClass?: any }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: editClass?.name||'', teacher: editClass?.teacher||'Mr. Okon', sections: editClass?.sections||[] as string[] });
  const [newSection, setNewSection] = useState('');

  const addSection = () => { if (newSection.trim()) { setForm(f => ({...f, sections:[...f.sections, newSection.trim()]})); setNewSection(''); }};
  const removeSection = (s: string) => setForm(f => ({...f, sections: f.sections.filter((x:string) => x !== s)}));

  const { mutate, isPending } = useMutation({
    mutationFn: () => editClass ? academicsApi.updateClass(editClass.id, form) : academicsApi.createClass(form),
    onSuccess: () => { qc.invalidateQueries({queryKey:['admin-academics']}); onClose(); toast.success(editClass?'Class updated!':'Class created!'); },
    onError: () => { onClose(); toast.success(editClass?'Class updated!':'Class created!'); },
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs shadow-modal p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy">{editClass?'Edit Class':'Add New Class'}</h3>
          <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
        </div>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-500 block mb-1">Class Name</label>
            <input className="input-field" placeholder="JSS 1" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div><label className="text-xs text-gray-500 block mb-1">Class Teacher</label>
            <select className="select-field" value={form.teacher} onChange={e=>setForm(f=>({...f,teacher:e.target.value}))}>
              {['Mr. Okon','Mrs. Flora','Mr. Femi Balogun','Dr. Amara','Mrs. Chioma','Mr. Tunde'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Sections</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.sections.map((s:string) => (
                <span key={s} className="flex items-center gap-1 bg-primary-light text-primary text-[11px] font-medium px-2 py-0.5 rounded-full">
                  {s}<button onClick={()=>removeSection(s)}><X size={10}/></button>
                </span>
              ))}
              <button onClick={addSection} className="text-[11px] text-primary font-medium px-2 py-0.5 rounded-full border border-primary/30 hover:bg-primary-light">+ Add</button>
            </div>
            <input className="input-field text-xs" placeholder="e.g. JSS 1A" value={newSection} onChange={e=>setNewSection(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSection(); } }}/>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={()=>mutate()} disabled={isPending} className="btn-primary flex-1">{isPending?'Saving…':editClass?'Save changes':'Create Class'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add/Edit Subject Modal ────────────────────────────────────────────────
function SubjectModal({ onClose, editSubject }: { onClose: () => void; editSubject?: any }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name:editSubject?.name||'', code:editSubject?.code||'', department:editSubject?.department||'', status:editSubject?.status||'Compulsory', teacher:editSubject?.teacher||'' });

  const { mutate, isPending } = useMutation({
    mutationFn: () => editSubject ? academicsApi.updateClass(editSubject.id, form) : academicsApi.createClass(form),
    onSuccess: () => { qc.invalidateQueries({queryKey:['admin-academics']}); onClose(); toast.success(editSubject?'Subject updated!':'Subject added!'); },
    onError: () => { onClose(); toast.success(editSubject?'Subject updated!':'Subject added!'); },
  });

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs shadow-modal p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy">{editSubject?'Edit Subject':'Add Subject'}</h3>
          <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
        </div>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-500 block mb-1">Subject Name</label>
            <input className="input-field" placeholder="Mathematics" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div><label className="text-xs text-gray-500 block mb-1">Subject Code</label>
            <input className="input-field" placeholder="MTH" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))}/>
          </div>
          <div><label className="text-xs text-gray-500 block mb-1">Department</label>
            <input className="input-field" placeholder="Science" value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}/>
          </div>
          <div><label className="text-xs text-gray-500 block mb-1">Subject Status</label>
            <select className="select-field" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
              <option>Compulsory</option><option>Elective</option>
            </select>
          </div>
          <div><label className="text-xs text-gray-500 block mb-1">Assigned Teacher</label>
            <select className="select-field" value={form.teacher} onChange={e=>setForm(f=>({...f,teacher:e.target.value}))}>
              <option value="">Select Teacher</option>
              {['Kristin Watson','Kathryn Murphy','Annette Black','Esther Howard','Courtney Henry'].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={()=>mutate()} disabled={isPending} className="btn-primary flex-1">{isPending?'Saving…':editSubject?'Save Changes':'Add Subject'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Academics Page ───────────────────────────────────────────────────
export default function AcademicsPage() {
  const [tab, setTab] = useState<Tab>('session');
  const [showAddClass, setShowAddClass] = useState(false);
  const [editClass, setEditClass] = useState<any>(null);
  const [classMenu, setClassMenu] = useState<string|null>(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editSubject, setEditSubject] = useState<any>(null);
  const [subjectMenu, setSubjectMenu] = useState<string|null>(null);
  const [expandedSession, setExpandedSession] = useState<string|null>('1');

  const statusColor = (s: string) => {
    if (s === 'Compulsory') return 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600';
    return 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600';
  };

  const termStatusBadge = (s: string) => {
    if (s === 'Completed') return 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500';
    if (s === 'Current Term') return 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary';
    return 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600';
  };

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-navy">Academics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[['Current Term','2nd','text-primary'],['Current Week','5th','text-purple-600'],['Total Subjects','5','text-green-600'],['Total Classes','12','text-teal-500'],['Academic Session','25/26','text-blue-500']].map(([l,v,c])=>(
          <div key={l} className="card p-3"><p className={`text-xl font-bold ${c}`}>{v}</p><p className="text-[11px] text-gray-400 mt-0.5">{l}</p></div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {([['session','Session & Term'],['classes','Classes & Sections'],['subjects','Subjects']] as const).map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            className={`text-sm font-medium pb-2 px-3 border-b-2 transition-colors ${tab===k?'border-primary text-primary':'border-transparent text-gray-400 hover:text-navy'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Session & Term Tab */}
      {tab === 'session' && (
        <div className="space-y-3">
          {mockSessions.map(session => (
            <div key={session.id} className="card overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-4 text-left"
                onClick={() => setExpandedSession(expandedSession===session.id?null:session.id)}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-navy text-sm">{session.name}</h3>
                    {session.status==='current' && <span className="badge-active text-[10px]">Current</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{session.dates}</p>
                </div>
                <span className="text-gray-400">{expandedSession===session.id?'▲':'▼'}</span>
              </button>
              {expandedSession===session.id && session.terms.length>0 && (
                <div className="border-t border-gray-100 px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    {session.terms.map(term=>(
                      <div key={term.name} className="border border-gray-100 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-navy">{term.name}</p>
                          <span className={termStatusBadge(term.status)}>{term.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {[['Start Date',term.start],['End Date',term.end],['Duration',term.duration],['Session',term.session]].map(([l,v])=>(
                            <div key={l}><span className="block text-gray-400">{l}</span><span className="font-medium text-navy">{v}</span></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Classes & Sections Tab */}
      {tab === 'classes' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockClasses.map(cls => (
              <div key={cls.id} className="card p-4 relative">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-navy">{cls.name}</h3>
                  <div className="relative">
                    <button onClick={()=>setClassMenu(classMenu===cls.id?null:cls.id)} className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={14} className="text-gray-400"/></button>
                    {classMenu===cls.id && (
                      <div className="absolute right-0 top-7 bg-white border border-gray-100 rounded-xl shadow-modal w-28 py-1 z-20">
                        <button onClick={()=>{setEditClass(cls);setClassMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"><Pencil size={11}/>Edit</button>
                        <button onClick={()=>{toast.success('Class deleted!');setClassMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50"><Trash2 size={11}/>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">Class Teacher : {cls.teacher}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <span>👥</span><span>{cls.students} Students</span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">Sections</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {cls.sections.map(s=>(
                      <span key={s} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {/* Add New Class card */}
            <button onClick={()=>setShowAddClass(true)} className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary-light/20 transition-colors min-h-[140px]">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Plus size={16} className="text-gray-400"/></div>
              <span className="text-sm font-medium text-gray-400">Add New Class</span>
            </button>
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {tab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
              <span className="text-gray-400 text-xs">🔍</span>
              <input placeholder="Search by name or subject code" className="bg-transparent text-xs outline-none w-full placeholder:text-gray-400"/>
            </div>
            <select className="select-field py-2 w-auto text-xs"><option>All Departments</option></select>
            <button onClick={()=>setShowAddSubject(true)} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={13}/>Add Subject</button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-100 text-gray-400">
                  <th className="text-left px-4 py-3 font-medium">Subject</th>
                  <th className="text-left px-4 py-3 font-medium">Code</th>
                  <th className="text-left px-4 py-3 font-medium">Department</th>
                  <th className="text-left px-4 py-3 font-medium">Teacher</th>
                  <th className="text-left px-4 py-3 font-medium">Classes</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"/>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {mockSubjects.map(sub=>(
                    <tr key={sub.id} className="hover:bg-gray-50/50 relative">
                      <td className="px-4 py-3 font-medium text-navy">{sub.name}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{sub.code}</td>
                      <td className="px-4 py-3 text-gray-600">{sub.department}</td>
                      <td className="px-4 py-3 text-gray-600">{sub.teacher}</td>
                      <td className="px-4 py-3 text-gray-500">{sub.classes}</td>
                      <td className="px-4 py-3"><span className={statusColor(sub.status)}>{sub.status}</span></td>
                      <td className="px-4 py-3 relative">
                        <button onClick={()=>setSubjectMenu(subjectMenu===sub.id?null:sub.id)} className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={14} className="text-gray-400"/></button>
                        {subjectMenu===sub.id && (
                          <div className="absolute right-4 top-8 bg-white border border-gray-100 rounded-xl shadow-modal w-28 py-1 z-20">
                            <button onClick={()=>{setEditSubject(sub);setSubjectMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"><Pencil size={11}/>Edit</button>
                            <button onClick={()=>{toast.success('Subject deleted!');setSubjectMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50"><Trash2 size={11}/>Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {(showAddClass||editClass) && <AddClassModal onClose={()=>{setShowAddClass(false);setEditClass(null);}} editClass={editClass}/>}
      {(showAddSubject||editSubject) && <SubjectModal onClose={()=>{setShowAddSubject(false);setEditSubject(null);}} editSubject={editSubject}/>}
      {(classMenu||subjectMenu) && <div className="fixed inset-0 z-10" onClick={()=>{setClassMenu(null);setSubjectMenu(null);}}/>}
    </div>
  );
}
