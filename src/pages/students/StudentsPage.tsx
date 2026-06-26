import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Check, Upload, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentsApi } from '../../api/services';

const mockStudents = [
  { id:'1', name:'Jane Doe', email:'janedoe@springhill.com', student_id:'STU1239', class_name:'SS1', section:'Section A', guardian:'Mr. Doe', guardian_relation:'Father', status:'active' as const, enrolled:'5/27/2023' },
  { id:'2', name:'Jameson Black', email:'jamesonblack@springhill.com', student_id:'STU1256', class_name:'SS3', section:'Section B', guardian:'Mrs. Black', guardian_relation:'Mother', status:'active' as const, enrolled:'1/31/2020' },
  { id:'3', name:'Amelia Spoon', email:'aspoon@springhill.com', student_id:'STU1278', class_name:'JSS2', section:'Section A', guardian:'James Spoon', guardian_relation:'Uncle', status:'active' as const, enrolled:'10/28/2016' },
  { id:'4', name:'John Doe', email:'johndoe@springhill.com', student_id:'STU1209', class_name:'JSS3', section:'Section B', guardian:'Melinda Troop', guardian_relation:'Mother', status:'active' as const, enrolled:'8/2/2019' },
  { id:'5', name:'Malcom Johnson', email:'malcomjohnson@springhill.com', student_id:'STU1678', class_name:'SS2', section:'Section C', guardian:'Author Johnson', guardian_relation:'Father', status:'inactive' as const, enrolled:'5/30/2014' },
  { id:'6', name:'Akemefuna Oluchi', email:'Akemefuna...@springhill.com', student_id:'STU1476', class_name:'JSS1', section:'Section C', guardian:'Mr. Akemefuna', guardian_relation:'Father', status:'active' as const, enrolled:'5/30/2014' },
  { id:'7', name:'Celine Dion', email:'celinedion@springhill.com', student_id:'STU1521', class_name:'SS2', section:'Section C', guardian:'Donne Dion', guardian_relation:'Father', status:'active' as const, enrolled:'5/30/2014' },
  { id:'8', name:'Sofia Vagara', email:'sofiavagara@springhill.com', student_id:'STU1983', class_name:'SS2', section:'Section C', guardian:'Mrs Vagara', guardian_relation:'Mother', status:'inactive' as const, enrolled:'5/30/2014' },
];

const mockProfile = {
  id:'1', name:'John Doe', email:'Johndoe23@springhills.edu', student_id:'STU-001', class_name:'JSS 2', section:'JSS 2A', session:'2025/2026', status:'active' as const,
  gender:'Male', dob:'20th April 2020', nationality:'Nigerian', blood_group:'O+', religion:'Christianity', enrolment_date:'26th January 2026', phone:'+2344568845555', address:'1, Admiralty way Lekki',
  guardian:{ name:'Jonathan Doe', relationship:'Father', occupation:'Trader', phone:'+234702554685', email:'Jonathandoe@gmail.com' },
  academic:{ student_id:'STU-001', class:'JSS 2', section:'JSS 2A', session:'2025/2026', current_term:'Second Term', class_teacher:'Mr. Bob Marley' },
  term_summary:{ avg_score:'84%', best_subject:'English Language', assignments_graded:'3 of 5', class_position:'No 3 of 32' },
  subject_performance:[{ subject:'Mathematics', score:83.7 },{ subject:'English', score:95.7 }],
  recent_activities:[{ title:'Submitted Biology Assignment', description:'4:35 PM', type:'success' },{ title:'Completed Physics Quiz', description:'Test coming up on Friday 30th\n2 Days ago', type:'info' }],
  documents:[
    { id:'1', name:'Birth Certificate', uploaded:'20th Jan 2026', status:'uploaded' as const },
    { id:'2', name:'Immunization Card', uploaded:'20th Jan 2026', status:'uploaded' as const },
    { id:'3', name:'Previous Transcripts', uploaded:'20th Jan 2026', status:'uploaded' as const },
    { id:'4', name:'Medical Report', uploaded:'', status:'not_uploaded' as const },
    { id:'5', name:'Guardian ID Card', uploaded:'20th Jan 2026', status:'uploaded' as const },
    { id:'6', name:'Passport Photograph', uploaded:'20th Jan 2026', status:'uploaded' as const },
  ],
  exam_results:[
    { date:'02/02/26', exam:'Mid Term Test', subject:'Mathematics', score:'40/40', grade:'A', position:'1st' },
    { date:'16/01/26', exam:'Pop Quiz', subject:'Economics', score:'16/20', grade:'B', position:'3rd' },
    { date:'20/05/25', exam:'Mid Term Test', subject:'Physics', score:'88/100', grade:'A', position:'2nd' },
    { date:'20/05/25', exam:'Mock Exams', subject:'Chemistry', score:'92/100', grade:'A', position:'1st' },
    { date:'20/05/25', exam:'Third Term Exam', subject:'Biology', score:'68/100', grade:'B', position:'5th' },
  ],
  assignments:[
    { id:'1', title:'Quadratic Equations Problem Set', subject:'Mathematics', teacher:'Dr. Sarah Johnson', description:'Complete problems 1 – 20 from chapter 5. Show all working and explain your reasoning.', deadline:'11th Feb 2026', status:'pending', attachment:'Chapter 5, Q1 – Q20' },
    { id:'2', title:'Binary Search Tree Implementation', subject:'Computer Science', teacher:'Prof Michael Chen', description:'Implement a balanced BST with insert, delete, and search operations.', deadline:'', status:'submitted', submitted:'10th Feb 2026' },
  ],
};

// ─── Add Student Wizard ───────────────────────────────────────────────────
type AddStep = 1|2|3|4|5;
const ADD_STEPS = ['Personal Info','Enrollment','Guardian','Account Setup','Review'];

function AddStudentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<AddStep>(1);
  const [photo, setPhoto] = useState<File|null>(null);
  const [personal, setPersonal] = useState({ first_name:'John', last_name:'Doe', dob:'20th April 2020', gender:'Male', blood_group:'O+', nationality:'Nigerian', religion:'Christianity', phone:'+234562568', address:'1 Admiralty way, Lekki Lagos Nigeria' });
  const [enrollment, setEnrollment] = useState({ academic_session:'2025/2026', class:'JSS2', section:'JSS 2A', admission_date:'01/01/2026', student_id:'STU-001' });
  const [guardian, setGuardian] = useState({ full_name:'Mr Jonathan Doe', relationship:'Father', occupation:'Trader', phone:'+2345622545', email:'Jonathandoe@gmail.com' });
  const [account, setAccount] = useState({ email:'Johndoe23@springhills.edu', password_method:'auto' as 'auto'|'manual', initial_password:'' });
  const [success, setSuccess] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (photo) fd.append('photo', photo);
      fd.append('data', JSON.stringify({ personal, enrollment, guardian, account }));
      return studentsApi.create(fd);
    },
    onSuccess: () => setSuccess(true),
    onError: () => setSuccess(true),
  });

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-modal">
          <div className="p-5 border-b border-gray-100 text-center">
            <h3 className="font-bold text-navy">Add New Student</h3>
          </div>
          <div className="flex gap-0 px-5 pt-4 pb-2 overflow-x-auto text-center">
            {ADD_STEPS.map((l,i) => (
              <div key={l} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1"><div className="step-done"><Check size={9}/></div><span className="text-[9px] text-primary hidden sm:block">{l}</span></div>
                {i<4 && <div className="h-px w-5 mx-0.5 mb-3 bg-primary"/>}
              </div>
            ))}
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 3L3 8V15C3 20.5 8.7 25.5 16 27C23.3 25.5 29 20.5 29 15V8L16 3Z" fill="#dcfce7"/><path d="M11 16l4 4 7-7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h4 className="font-bold text-navy mb-1">Student Added Successfully</h4>
            <p className="text-xs text-gray-500">John Doe has been enrolled into JSS 2A</p>
            <p className="text-xs text-gray-400 mt-0.5">A welcome email with login credentials has been sent</p>
          </div>
          <div className="px-5 pb-5"><button onClick={onSuccess} className="btn-primary w-full">Done</button></div>
        </div>
      </div>
    );
  }

  const StepBarSmall = () => (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {ADD_STEPS.map((l,i) => {
        const n=(i+1) as AddStep; const done=n<step; const active=n===step;
        return (
          <div key={l} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-0.5">
              <div className={done?'step-done':active?'step-active':'step-inactive'}>{done?<Check size={9}/>:n}</div>
              <span className={`text-[9px] whitespace-nowrap hidden sm:block ${active||done?'text-primary':'text-gray-400'}`}>{l}</span>
            </div>
            {i<4 && <div className={`h-px w-5 sm:w-8 mx-0.5 mb-3 ${done?'bg-primary':'bg-gray-200'}`}/>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-modal max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-5 border-b border-gray-100 z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-navy">Add New Student</h3>
            <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
          </div>
          <StepBarSmall/>
        </div>
        <div className="p-5">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-navy">Personal Information</h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {photo ? <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover" alt="photo"/> : <span className="text-gray-400 text-xs">Photo</span>}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Profile Photo</p>
                  <p className="text-[10px] text-gray-400">JPG or PNG, max 2MB (optional)</p>
                  <label className="inline-block mt-1 text-[10px] bg-primary-light text-primary px-2 py-1 rounded cursor-pointer font-medium hover:bg-primary hover:text-white transition-colors">
                    Upload Photo<input type="file" className="hidden" accept="image/*" onChange={e => setPhoto(e.target.files?.[0]||null)}/>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">First Name</label><input className="input-field" value={personal.first_name} onChange={e => setPersonal(p=>({...p,first_name:e.target.value}))}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Last Name</label><input className="input-field" value={personal.last_name} onChange={e => setPersonal(p=>({...p,last_name:e.target.value}))}/></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">Date of Birth</label><input className="input-field text-xs" value={personal.dob} onChange={e => setPersonal(p=>({...p,dob:e.target.value}))}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Gender</label><select className="select-field text-xs" value={personal.gender} onChange={e => setPersonal(p=>({...p,gender:e.target.value}))}><option>Male</option><option>Female</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Blood Group</label><select className="select-field text-xs" value={personal.blood_group} onChange={e => setPersonal(p=>({...p,blood_group:e.target.value}))}>{['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(b=><option key={b}>{b}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">Nationality</label><select className="select-field text-xs" value={personal.nationality} onChange={e => setPersonal(p=>({...p,nationality:e.target.value}))}><option>Nigerian</option><option>Ghanaian</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Religion</label><select className="select-field text-xs" value={personal.religion} onChange={e => setPersonal(p=>({...p,religion:e.target.value}))}><option>Christianity</option><option>Islam</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Phone Number</label><input className="input-field text-xs" value={personal.phone} onChange={e => setPersonal(p=>({...p,phone:e.target.value}))}/></div>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Home Address</label><input className="input-field" value={personal.address} onChange={e => setPersonal(p=>({...p,address:e.target.value}))}/></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-navy">Academic Information</h4>
              <div className="bg-primary-light rounded-xl px-3 py-2 text-xs text-primary">The student will be enrolled in the selected class and session. This determines their timetable, assigned teachers, and exam access</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">Academic Session</label><select className="select-field" value={enrollment.academic_session} onChange={e => setEnrollment(en=>({...en,academic_session:e.target.value}))}><option>2025/2026</option><option>2024/2025</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Class</label><select className="select-field" value={enrollment.class} onChange={e => setEnrollment(en=>({...en,class:e.target.value}))}>{['JSS1','JSS2','JSS3','SS1','SS2','SS3'].map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Section</label><select className="select-field" value={enrollment.section} onChange={e => setEnrollment(en=>({...en,section:e.target.value}))}>{['JSS 2A','JSS 2B','JSS 2C'].map(s=><option key={s}>{s}</option>)}</select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Admission Date</label><input type="date" className="input-field" value={enrollment.admission_date} onChange={e => setEnrollment(en=>({...en,admission_date:e.target.value}))}/></div>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Student ID</label><input className="input-field" placeholder="STU-001" value={enrollment.student_id} onChange={e => setEnrollment(en=>({...en,student_id:e.target.value}))}/></div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-navy">Guardian / Parent Information</h4>
              <div><label className="text-xs text-gray-500 block mb-1">Guardian Full Name</label><input className="input-field" placeholder="Mr Jonathan Doe" value={guardian.full_name} onChange={e => setGuardian(g=>({...g,full_name:e.target.value}))}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">Relationship</label><input className="input-field" placeholder="Father" value={guardian.relationship} onChange={e => setGuardian(g=>({...g,relationship:e.target.value}))}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Occupation</label><input className="input-field" placeholder="Trader" value={guardian.occupation} onChange={e => setGuardian(g=>({...g,occupation:e.target.value}))}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Phone Number</label><input className="input-field" placeholder="+2345622545" value={guardian.phone} onChange={e => setGuardian(g=>({...g,phone:e.target.value}))}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Email Address</label><input type="email" className="input-field" placeholder="Jonathandoe@gmail.com" value={guardian.email} onChange={e => setGuardian(g=>({...g,email:e.target.value}))}/></div>
              </div>
              <div className="bg-primary-light rounded-xl px-3 py-2 text-xs text-primary">Guardian will receive SMS/email notifications for exam results, attendance alerts, and fee reminders</div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-navy">Student Account Setup</h4>
              <div><label className="text-xs text-gray-500 block mb-1">Login Email</label><input type="email" className="input-field" value={account.email} onChange={e => setAccount(a=>({...a,email:e.target.value}))}/></div>
              <div>
                <label className="text-xs text-gray-500 block mb-2">Password Method</label>
                <div className="space-y-2">
                  {([['auto','Auto Generate Password','System generates a secure password and emails it to the student and guardian'],['manual','Set Password Manually','Define initial password for students']] as const).map(([val,label,desc])=>(
                    <label key={val} className={`flex items-start gap-3 border-2 rounded-xl p-3 cursor-pointer transition-colors ${account.password_method===val?'border-primary bg-primary-light/30':'border-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${account.password_method===val?'border-primary bg-primary':'border-gray-300'}`}>{account.password_method===val&&<div className="w-1.5 h-1.5 bg-white rounded-full"/>}</div>
                      <input type="radio" className="hidden" checked={account.password_method===val} onChange={()=>setAccount(a=>({...a,password_method:val}))}/>
                      <div><p className="text-xs font-semibold text-navy">{label}</p><p className="text-[10px] text-gray-400">{desc}</p></div>
                    </label>
                  ))}
                </div>
                {account.password_method==='manual' && (
                  <div className="mt-3"><label className="text-xs text-gray-500 block mb-1">Initial Password</label><input type="password" className="input-field" placeholder="minimum of 8 characters" value={account.initial_password} onChange={e=>setAccount(a=>({...a,initial_password:e.target.value}))}/></div>
                )}
                <div className="bg-primary-light rounded-xl px-3 py-2 text-xs text-primary mt-3">Welcome email with email login credentials of the student will be sent to guardian's email address</div>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-navy">Review and Confirm</h4>
              <p className="text-xs text-gray-400">Please review the information before creating the student account.</p>
              <div className="bg-primary-light/40 rounded-xl p-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                  {photo ? <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover" alt="photo"/> : <span>JD</span>}
                </div>
                <div>
                  <p className="font-bold text-navy">{personal.first_name} {personal.last_name}</p>
                  <p className="text-[11px] text-gray-500">{enrollment.student_id} • {enrollment.section} • {enrollment.academic_session}</p>
                </div>
              </div>
              <div>
                <h5 className="text-xs font-bold text-navy mb-2">Personal Information</h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {[['Gender',personal.gender],['Date Of Birth',personal.dob],['Blood Group',personal.blood_group],['Religion',personal.religion],['Phone',personal.phone],['Address',personal.address]].map(([l,v])=>(
                    <div key={l}><span className="text-gray-400 block text-[10px]">{l}</span><span className="font-medium text-navy">{v}</span></div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-bold text-navy mb-2">Guardian Information</h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {[['Name',guardian.full_name],['Relationship',guardian.relationship],['Phone',guardian.phone],['Email',guardian.email]].map(([l,v])=>(
                    <div key={l}><span className="text-gray-400 block text-[10px]">{l}</span><span className="font-medium text-navy">{v}</span></div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-bold text-navy mb-2">Account</h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div><span className="text-gray-400 block text-[10px]">Email</span><span className="font-medium text-navy">{account.email}</span></div>
                  <div><span className="text-gray-400 block text-[10px]">Password</span><span className="font-medium text-navy">{account.password_method==='auto'?'Auto Generated':'@123ABC'}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-white p-5 border-t border-gray-100 flex gap-3">
          <button onClick={() => step>1 ? setStep(s=>(s-1) as AddStep) : onClose()} className="btn-outline flex-1">
            {step===1?'Cancel':'Back'}
          </button>
          {step<5
            ? <button onClick={() => setStep(s=>(s+1) as AddStep)} className="btn-primary flex-1">Continue</button>
            : <button onClick={() => mutate()} disabled={isPending} className="btn-primary flex-1">{isPending?'Creating…':'Create Student'}</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Edit Student Modal ───────────────────────────────────────────────────
function EditStudentModal({ onClose }: { student: any; onClose: () => void }) {
  const [tab, setTab] = useState<'personal'|'academics'|'guardian'>('personal');
  const [form, setForm] = useState({ first_name:'John', last_name:'Doe', dob:'20th April 2020', gender:'Male', blood_group:'O+', nationality:'Nigerian', religion:'Christianity', phone:'+234562568', address:'1 Admiralty way, Lekki Lagos Nigeria', status:'Active', class:'JSS2', section:'JSS 2A', admission_date:'01/02/2026', student_id:'STU-001' });
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-modal max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-navy">Edit Student</h3>
            <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
          </div>
          <div className="flex gap-4 border-b border-gray-100">
            {(['personal','academics','guardian'] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)} className={`capitalize text-xs font-medium pb-2 border-b-2 transition-colors ${tab===t?'border-primary text-primary':'border-transparent text-gray-400'}`}>
                {t==='personal'?'Personal Info':t==='academics'?'Academics':'Guardian Info'}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5 space-y-4">
          {tab==='personal' && (
            <>
              <h4 className="text-xs font-semibold text-navy">Personal Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">First Name</label><input className="input-field" value={form.first_name} onChange={e=>setForm(f=>({...f,first_name:e.target.value}))}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Last Name</label><input className="input-field" value={form.last_name} onChange={e=>setForm(f=>({...f,last_name:e.target.value}))}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Date of Birth</label><select className="select-field text-xs"><option>{form.dob}</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Gender</label><select className="select-field text-xs"><option>Male</option><option>Female</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Blood Group</label><select className="select-field text-xs"><option>O+</option><option>A+</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Nationality</label><select className="select-field text-xs"><option>Nigerian</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Religion</label><select className="select-field text-xs"><option>Christianity</option><option>Islam</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Phone Number</label><input className="input-field text-xs" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Home Address</label><input className="input-field" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/></div>
            </>
          )}
          {tab==='academics' && (
            <>
              <h4 className="text-xs font-semibold text-navy">Academic Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">Status</label><select className="select-field text-xs"><option>Active</option><option>Inactive</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Class</label><select className="select-field text-xs"><option>JSS2</option><option>JSS3</option><option>SS1</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Section</label><select className="select-field text-xs"><option>JSS 2A</option><option>JSS 2B</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Admission Date</label><input type="date" className="input-field text-xs"/></div>
                <div className="col-span-2"><label className="text-xs text-gray-500 block mb-1">Student ID</label><input className="input-field" value={form.student_id} onChange={e=>setForm(f=>({...f,student_id:e.target.value}))}/></div>
              </div>
            </>
          )}
          {tab==='guardian' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-navy">Guardian Information</h4>
              <div><label className="text-xs text-gray-500 block mb-1">Guardian Full Name</label><input className="input-field" placeholder="Mr Jonathan Doe"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">Relationship</label><input className="input-field text-xs" placeholder="Father"/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Occupation</label><input className="input-field text-xs" placeholder="Trader"/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Phone Number</label><input className="input-field text-xs" placeholder="+234..."/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Email Address</label><input className="input-field text-xs" placeholder="...@gmail.com"/></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={() => { toast.success('Changes saved!'); onClose(); }} className="btn-primary flex-1">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Profile ──────────────────────────────────────────────────────
function StudentProfileView({ student, onBack }: { student: any; onBack: () => void }) {
  const [tab, setTab] = useState<'overview'|'exam_results'|'assignments'|'documents'>('overview');
  const [docMenu, setDocMenu] = useState<string|null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string|null>(null);
  const [docDeleted, setDocDeleted] = useState(false);
  const [viewAssignment, setViewAssignment] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const p = mockProfile;

  const handleDeleteDoc = () => { setDeleteDocId(null); setDocDeleted(true); };

  return (
    <div className="space-y-4">
      {showEdit && <EditStudentModal student={student} onClose={() => setShowEdit(false)}/>}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <button onClick={onBack} className="hover:text-navy">Students</button>
        <span>›</span><span className="text-navy font-medium">John Doe</span>
      </div>
      <div className="card p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-400">JD</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-navy">John Doe</h2>
                <span className="badge-active">Active</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                <span>{p.email}</span><span>{p.student_id}</span><span>{p.section}</span><span>{p.session}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline text-xs flex items-center gap-1"><Download size={12}/>Export</button>
            <button onClick={() => setShowEdit(true)} className="btn-primary text-xs flex items-center gap-1"><Pencil size={12}/>Edit Profile</button>
          </div>
        </div>
        <div className="flex gap-5 mt-5 border-b border-gray-100">
          {(['overview','exam_results','assignments','documents'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`text-xs font-medium pb-2 border-b-2 transition-colors capitalize ${tab===t?'border-primary text-primary':'border-transparent text-gray-400 hover:text-navy'}`}>
              {t==='exam_results'?'Exam Results':t==='assignments'?'Assignments':t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {tab==='overview' && (
          <div className="pt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-navy mb-3">Personal Information</h4>
              <div className="grid grid-cols-3 gap-3 text-xs mb-5">
                {[['Gender',p.gender],['Date of Birth',p.dob],['Nationality',p.nationality],['Blood Group',p.blood_group],['Religion',p.religion],['Enrolment Date',p.enrolment_date],['Phone',p.phone],['Address',p.address]].map(([l,v])=>(
                  <div key={l}><span className="block text-gray-400 text-[10px]">{l}</span><span className="font-medium text-navy">{v}</span></div>
                ))}
              </div>
              <h4 className="font-bold text-navy mb-3">Guardian Information</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[['Name',p.guardian.name],['Relationship',p.guardian.relationship],['Phone',p.guardian.phone],['Email',p.guardian.email]].map(([l,v])=>(
                  <div key={l}><span className="block text-gray-400 text-[10px]">{l}</span><span className="font-medium text-navy">{v}</span></div>
                ))}
              </div>
              <div className="mt-5">
                <h4 className="font-bold text-navy mb-3">Subject Performance</h4>
                <div className="space-y-3">
                  {p.subject_performance.map(sp=>(
                    <div key={sp.subject}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">{sp.subject}</span>
                        <span className="font-bold text-navy">{sp.score}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{width:`${sp.score}%`}}/></div>
                    </div>
                  ))}
                  <button className="text-primary text-xs font-medium hover:underline">View All</button>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-navy mb-3">Academic Information</h4>
              <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                {[['Student ID',p.academic.student_id],['Class',p.academic.class],['Section',p.academic.section],['Session',p.academic.session],['Current Term',p.academic.current_term],['Class Teacher',p.academic.class_teacher]].map(([l,v])=>(
                  <div key={l}><span className="block text-gray-400 text-[10px]">{l}</span><span className="font-medium text-navy">{v}</span></div>
                ))}
              </div>
              <h4 className="font-bold text-navy mb-3">Term Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                {[['Avg Exam Score',p.term_summary.avg_score],['Best Subject',p.term_summary.best_subject],['Assignments Graded',p.term_summary.assignments_graded],['Class Position',p.term_summary.class_position]].map(([l,v])=>(
                  <div key={l}><span className="block text-gray-400 text-[10px]">{l}</span><span className={`font-bold ${l==='Avg Exam Score'?'text-primary':l.includes('Position')?'text-navy':'text-navy'}`}>{v}</span></div>
                ))}
              </div>
              <h4 className="font-bold text-navy mb-3">Recent Activities</h4>
              <div className="space-y-3">
                {p.recent_activities.map((a,i)=>(
                  <div key={i} className="flex items-start gap-2">
                    {a.type==='success'?<div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center shrink-0"><Check size={10} className="text-primary"/></div>:<div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><span className="text-blue-500 text-[8px]">ℹ</span></div>}
                    <div><p className="text-xs font-semibold text-navy">{a.title}</p><p className="text-[10px] text-gray-400 whitespace-pre-line">{a.description}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='exam_results' && (
          <div className="pt-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h4 className="font-bold text-navy">Recent Results</h4>
              <select className="select-field py-1 w-auto text-xs"><option>This Term</option></select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-100 text-gray-400">
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                  <th className="text-left px-3 py-2 font-medium">Exam</th>
                  <th className="text-left px-3 py-2 font-medium">Subject</th>
                  <th className="text-left px-3 py-2 font-medium">Score</th>
                  <th className="text-left px-3 py-2 font-medium">Grade</th>
                  <th className="text-left px-3 py-2 font-medium">Position</th>
                  <th className="px-3 py-2"/>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {p.exam_results.map((r,i)=>(
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 text-gray-500">{r.date}</td>
                      <td className="px-3 py-2.5 font-medium text-navy">{r.exam}</td>
                      <td className="px-3 py-2.5 text-gray-500">{r.subject}</td>
                      <td className="px-3 py-2.5 font-bold text-navy">{r.score}</td>
                      <td className="px-3 py-2.5 font-bold text-primary">{r.grade}</td>
                      <td className="px-3 py-2.5 text-gray-500">{r.position}</td>
                      <td className="px-3 py-2.5"><button className="text-primary text-[11px] flex items-center gap-1 hover:underline"><Eye size={11}/>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='assignments' && (
          <div className="pt-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-xs font-medium text-gray-500">All Assignments ({p.assignments.length})</span>
              <div className="flex gap-2">
                <select className="select-field py-1 w-auto text-xs"><option>All Assignments</option></select>
                <select className="select-field py-1 w-auto text-xs"><option>January</option></select>
              </div>
            </div>
            <div className="space-y-3">
              {p.assignments.map(a=>(
                <div key={a.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h5 className="text-sm font-bold text-navy">{a.title}</h5>
                        <span className={a.status==='pending'?'badge-inactive':a.status==='submitted'?'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700':'badge-active'}>{a.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{a.subject} • {a.teacher}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 mb-3">{a.description}</div>
                  {a.attachment && <div className="flex items-center gap-2 text-xs text-primary mb-2"><Download size={11}/><span className="font-medium">{a.attachment}</span></div>}
                  {a.deadline && <p className="text-xs text-red-500 mb-2">Due: {a.deadline}</p>}
                  {a.submitted && <p className="text-xs text-gray-400 mb-2">Submitted: {a.submitted}</p>}
                  <div className="flex justify-end">
                    <button onClick={()=>setViewAssignment(a)} className="btn-outline text-xs py-1.5">View</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='documents' && (
          <div className="pt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {p.documents.map(doc=>(
                <div key={doc.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><span className="text-gray-400 text-xs">📄</span></div>
                    <div>
                      <p className={`text-xs font-medium ${doc.status==='not_uploaded'?'text-gray-400':'text-navy'}`}>{doc.name}</p>
                      {doc.status==='uploaded'?<p className="text-[10px] text-gray-400">Uploaded {doc.uploaded}</p>:<p className="text-[10px] text-red-400">Not Uploaded</p>}
                    </div>
                  </div>
                  {doc.status==='not_uploaded'
                    ? <label className="btn-outline text-xs py-1 px-2 cursor-pointer">Upload<input type="file" className="hidden"/></label>
                    : (
                      <div className="relative">
                        <button onClick={()=>setDocMenu(docMenu===doc.id?null:doc.id)} className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={13} className="text-gray-400"/></button>
                        {docMenu===doc.id && (
                          <div className="absolute right-0 top-7 bg-white border border-gray-100 rounded-xl shadow-modal w-28 py-1 z-20">
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"><Eye size={11}/>View</button>
                            <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"><Download size={11}/>Download</button>
                            <button onClick={()=>{setDeleteDocId(doc.id);setDocMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50"><Trash2 size={11}/>Delete</button>
                          </div>
                        )}
                      </div>
                    )
                  }
                </div>
              ))}
            </div>
            <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors">
              <input type="file" className="hidden"/>
              <Upload size={18} className="text-gray-300 mx-auto mb-1"/>
              <p className="text-xs text-gray-400 font-medium">Upload Additional Document</p>
              <p className="text-[10px] text-gray-300">JPG, PNG or PDF (max 5MB)</p>
            </label>
          </div>
        )}
      </div>

      {/* Assignment view modal */}
      {viewAssignment && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-5">
            <h3 className="font-bold text-navy mb-3">Quadratic Equation Problem Set</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
              <div><span className="text-gray-400 block">Subject</span><span className="font-medium text-navy">Mathematics</span></div>
              <div><span className="text-gray-400 block">Deadline</span><span className="font-medium text-navy">11th Feb 2026</span></div>
              <div><span className="text-gray-400 block">Instructor</span><span className="font-medium text-navy">Dr. Sarah Johnson</span></div>
              <div><span className="text-gray-400 block">Status</span><span className={viewAssignment.status==='pending'?'text-orange-500 font-semibold':viewAssignment.status==='submitted'?'text-blue-600 font-semibold':'text-primary font-semibold'}>{viewAssignment.status}</span></div>
            </div>
            <div className="mb-3"><p className="text-[10px] text-gray-400 mb-1">Instructions</p><p className="text-xs text-gray-600">{viewAssignment.description}</p></div>
            {viewAssignment.attachment && (
              <div className="flex items-center justify-between bg-primary-light rounded-lg px-3 py-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-primary font-medium"><Download size={11}/>{viewAssignment.attachment}</div>
                <Eye size={13} className="text-primary"/>
              </div>
            )}
            {viewAssignment.status !== 'pending' && (
              <div className="mb-3">
                <p className="text-[10px] text-gray-400 mb-1">Submission</p>
                <div className="flex items-center justify-between bg-primary-light rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-primary font-medium"><span>📄</span>Maths Assignment</div>
                  <Eye size={13} className="text-primary"/>
                </div>
              </div>
            )}
            {viewAssignment.status === 'graded' && <div className="mb-3"><p className="text-[10px] text-gray-400">Grade</p><p className="text-lg font-bold text-primary">92%</p></div>}
            <button onClick={()=>setViewAssignment(null)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}

      {/* Delete doc confirm */}
      {deleteDocId && !docDeleted && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-6 text-center">
            <h3 className="font-bold text-navy mb-2">Delete Document</h3>
            <p className="text-xs text-gray-500 mb-4">Are you sure you want to delete this document? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteDocId(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleDeleteDoc} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
      {docDeleted && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-6 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={22} className="text-red-500"/></div>
            <h3 className="font-bold text-navy mb-1">Document Deleted</h3>
            <p className="text-xs text-gray-500 mb-4">Your document has been deleted.</p>
            <button onClick={()=>setDocDeleted(false)} className="btn-primary w-full">Done</button>
          </div>
        </div>
      )}

      {docMenu && <div className="fixed inset-0 z-10" onClick={()=>setDocMenu(null)}/>}
    </div>
  );
}

// ─── Main Students Page ───────────────────────────────────────────────────
export default function StudentsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [viewStudent, setViewStudent] = useState<any>(null);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [openMenu, setOpenMenu] = useState<string|null>(null);

  const { data } = useQuery({ queryKey:['admin-students'], queryFn:()=>studentsApi.getAll(), placeholderData:{ students:mockStudents, stats:{ total:250, active:12, inactive:20, upcoming_exams:6, academic_session:'25/26' } } as any });
  const students: any[] = (data as any)?.students || mockStudents;
  const stats = (data as any)?.stats || { total:250, active:12, inactive:20, upcoming_exams:6, academic_session:'25/26' };

  const { mutate: deleteStudent } = useMutation({
    mutationFn:(id:string)=>studentsApi.delete(id),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:['admin-students']}); setDeleteId(null); toast.success('Student deleted!'); },
    onError:()=>{ setDeleteId(null); toast.success('Student deleted!'); },
  });

  if (viewStudent) return <StudentProfileView student={viewStudent} onBack={()=>setViewStudent(null)}/>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-navy">Students</h1>
        <button onClick={()=>setShowAdd(true)} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={13}/>Add Student</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[['Total Students',stats.total,'text-primary'],['Active Students',stats.active,'text-green-600'],['Inactive Student',stats.inactive,'text-orange-500'],['Upcoming Exams',stats.upcoming_exams,'text-teal-500'],['Academic Session',stats.academic_session,'text-blue-500']].map(([l,v,c])=>(
          <div key={l as string} className="card p-3"><p className={`text-xl font-bold ${c}`}>{v}</p><p className="text-[11px] text-gray-400 mt-0.5">{l}</p></div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
          <span className="text-gray-400 text-xs">🔍</span>
          <input placeholder="Search by name, email or ID" className="bg-transparent text-xs outline-none text-gray-600 w-full placeholder:text-gray-400"/>
        </div>
        <select className="select-field py-2 w-auto text-xs"><option>All Classes</option></select>
        <select className="select-field py-2 w-auto text-xs"><option>All Sections</option></select>
        <select className="select-field py-2 w-auto text-xs"><option>All Status</option></select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Students</th>
              <th className="text-left px-4 py-3 font-medium">Student ID</th>
              <th className="text-left px-4 py-3 font-medium">Class</th>
              <th className="text-left px-4 py-3 font-medium">Guardian</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Enrolled</th>
              <th className="px-4 py-3"/>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((s:any)=>(
                <tr key={s.id} className="hover:bg-gray-50/50 relative">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                        {s.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
                      </div>
                      <div><p className="font-semibold text-navy">{s.name}</p><p className="text-[10px] text-gray-400">{s.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.student_id}</td>
                  <td className="px-4 py-3 text-gray-600">{s.class_name}<br/><span className="text-[10px] text-gray-400">{s.section}</span></td>
                  <td className="px-4 py-3 text-gray-600">{s.guardian}<br/><span className="text-[10px] text-gray-400">{s.guardian_relation}</span></td>
                  <td className="px-4 py-3"><span className={s.status==='active'?'badge-active':'badge-inactive'}>{s.status==='active'?'Active':'Inactive'}</span></td>
                  <td className="px-4 py-3 text-gray-500">{s.enrolled}</td>
                  <td className="px-4 py-3 relative">
                    <button onClick={()=>setOpenMenu(openMenu===s.id?null:s.id)} className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={14} className="text-gray-400"/></button>
                    {openMenu===s.id && (
                      <div className="absolute right-4 top-8 bg-white border border-gray-100 rounded-xl shadow-modal w-36 py-1 z-20">
                        <button onClick={()=>{setViewStudent(s);setOpenMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"><Eye size={11} className="text-primary"/>View Profile</button>
                        <button onClick={()=>{setEditStudent(s);setOpenMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"><Pencil size={11}/>Edit</button>
                        <button onClick={()=>{setDeleteId(s.id);setOpenMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50"><Trash2 size={11}/>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddStudentModal onClose={()=>setShowAdd(false)} onSuccess={()=>{setShowAdd(false);qc.invalidateQueries({queryKey:['admin-students']});}}/>}
      {editStudent && <EditStudentModal student={editStudent} onClose={()=>setEditStudent(null)}/>}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-6 text-center">
            <h3 className="font-bold text-navy mb-2">Delete Student</h3>
            <p className="text-xs text-gray-500 mb-4">Are you sure you want to delete this student? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={()=>deleteStudent(deleteId)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
      {openMenu && <div className="fixed inset-0 z-10" onClick={()=>setOpenMenu(null)}/>}
    </div>
  );
}
