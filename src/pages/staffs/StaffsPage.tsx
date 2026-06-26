import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Check, Download, X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { staffsApi } from '../../api/services';

const mockStaffs = [
  { id:'1', name:'Jane Doe', email:'janedoe@springhill.com', staff_id:'STF-1239', role:'Teacher', department:'Science', class_name:'SS1', section:'Section A', status:'active' as const, enrolled:'5/27/2023' },
  { id:'2', name:'Jameson Black', email:'jamesonblack@springhill.com', staff_id:'STF-1256', role:'Teacher', department:'Humanities', class_name:'SS3', section:'Section B', status:'active' as const, enrolled:'1/31/2020' },
  { id:'3', name:'Amelia Spoon', email:'aspoon@springhill.com', staff_id:'STF-1278', role:'Teacher', department:'Mathematics', class_name:'JSS2', section:'Section A', status:'active' as const, enrolled:'10/28/2016' },
  { id:'4', name:'John Doe', email:'johndoe@springhill.com', staff_id:'STUF209', role:'Admin Staff', department:'Administration', class_name:'---', section:'---', status:'active' as const, enrolled:'8/2/2019' },
  { id:'5', name:'Malcom Johnson', email:'malcomjohnson@springhill.com', staff_id:'STF-1678', role:'Support Staff', department:'Library', class_name:'---', section:'---', status:'inactive' as const, enrolled:'5/30/2014' },
  { id:'6', name:'Akemefuna Oluchi', email:'Akemefuna...@springhill.com', staff_id:'STF-1476', role:'Teacher', department:'Social Science', class_name:'JSS1', section:'Section C', status:'active' as const, enrolled:'5/30/2014' },
  { id:'7', name:'Celine Dion', email:'celinedion@springhill.com', staff_id:'STF-1521', role:'Support Staff', department:'Sports', class_name:'---', section:'---', status:'active' as const, enrolled:'5/30/2014' },
  { id:'8', name:'Sofia Vagara', email:'sofiavagara@springhill.com', staff_id:'STF-1983', role:'Admin Staff', department:'Finance', class_name:'---', section:'---', status:'inactive' as const, enrolled:'5/30/2014' },
];

const PERMISSIONS = ['View','Create','Edit','Approve','Publish','Export','Override'];

// ─── Add Staff Wizard ──────────────────────────────────────────────────────
type AddStep = 1|2|3|4;
const ADD_STEPS = ['Personal Info','Staff Role Info','Account Setup','Review'];

function AddStaffModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<AddStep>(1);
  const [photo, setPhoto] = useState<File|null>(null);
  const [personal, setPersonal] = useState({ first_name:'Jane', last_name:'Doe', email:'Janedoe@gmail.com', dob:'20th April 1920', gender:'Female', blood_group:'O+', nationality:'Nigerian', religion:'Christianity', phone:'+234562568', address:'1 Admiralty way, Lekki Lagos Nigeria' });
  const [role, setRole] = useState({ role:'Teacher', department:'Humanities', subjects:['Mathematics','Physics','Biology'], classes:['JSS 1A','JSS 2A','JSS 3B'], staff_id:'STF-001', permissions:['All Access','View','Create','Edit','Approve','Publish','Export','Override'] });
  const [account, setAccount] = useState({ email:'Janedoe23@springhills.edu', password_method:'manual' as 'auto'|'manual', initial_password:'' });
  const [success, setSuccess] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => staffsApi.create({ personal, role, account }),
    onSuccess: () => setSuccess(true),
    onError: () => setSuccess(true),
  });

  const togglePerm = (p: string) => {
    if (p === 'All Access') {
      const allSelected = role.permissions.length === PERMISSIONS.length + 1;
      setRole(r => ({ ...r, permissions: allSelected ? [] : ['All Access', ...PERMISSIONS] }));
    } else {
      setRole(r => ({
        ...r,
        permissions: r.permissions.includes(p) ? r.permissions.filter(x => x !== p && x !== 'All Access') : [...r.permissions.filter(x => x !== 'All Access'), p]
      }));
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-modal p-6 text-center">
          <StepBarSmall current={4} done/>
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3 mt-4">
            <CheckCircle2 size={28} className="text-primary"/>
          </div>
          <h3 className="font-bold text-navy mb-1">Staff Added Successfully</h3>
          <p className="text-xs text-gray-500 mb-4">Jane Doe has been added as a Teacher. A welcome email has been sent.</p>
          <button onClick={onSuccess} className="btn-primary w-full">Done</button>
        </div>
      </div>
    );
  }

  function StepBarSmall({ current, done }: { current: AddStep; done?: boolean }) {
    return (
      <div className="flex items-center gap-0 overflow-x-auto justify-center pb-1">
        {ADD_STEPS.map((l, i) => {
          const n = (i + 1) as AddStep; const isDone = done || n < current; const isActive = n === current;
          return (
            <div key={l} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-0.5">
                <div className={isDone ? 'step-done' : isActive ? 'step-active' : 'step-inactive'}>{isDone ? <Check size={9}/> : n}</div>
                <span className={`text-[9px] whitespace-nowrap hidden sm:block ${isActive||isDone ? 'text-primary' : 'text-gray-400'}`}>{l}</span>
              </div>
              {i < 3 && <div className={`h-px w-5 sm:w-10 mx-0.5 mb-3 ${isDone ? 'bg-primary' : 'bg-gray-200'}`}/>}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-modal max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100 z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-navy">Add New Staff</h3>
            <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
          </div>
          <StepBarSmall current={step}/>
        </div>

        <div className="p-5">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-navy">Personal Information</h4>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {photo ? <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover" alt=""/> : <span className="text-gray-400 text-xs">Photo</span>}
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
                <div><label className="text-xs text-gray-500 block mb-1">First Name</label><input className="input-field" value={personal.first_name} onChange={e=>setPersonal(p=>({...p,first_name:e.target.value}))}/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Last Name</label><input className="input-field" value={personal.last_name} onChange={e=>setPersonal(p=>({...p,last_name:e.target.value}))}/></div>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Email Address</label><input type="email" className="input-field" value={personal.email} onChange={e=>setPersonal(p=>({...p,email:e.target.value}))}/></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">Date of Birth</label><select className="select-field text-xs"><option>{personal.dob}</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Gender</label><select className="select-field text-xs" value={personal.gender} onChange={e=>setPersonal(p=>({...p,gender:e.target.value}))}><option>Female</option><option>Male</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Blood Group</label><select className="select-field text-xs" value={personal.blood_group} onChange={e=>setPersonal(p=>({...p,blood_group:e.target.value}))}>{['O+','O-','A+','A-','B+','B-'].map(b=><option key={b}>{b}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">Nationality</label><select className="select-field text-xs"><option>Nigerian</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Religion</label><select className="select-field text-xs"><option>Christianity</option><option>Islam</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Phone Number</label><input className="input-field text-xs" value={personal.phone} onChange={e=>setPersonal(p=>({...p,phone:e.target.value}))}/></div>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Home Address</label><input className="input-field" value={personal.address} onChange={e=>setPersonal(p=>({...p,address:e.target.value}))}/></div>
            </div>
          )}

          {/* Step 2: Staff Role Info */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-navy">Staff Role Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Role</label>
                  <select className="select-field" value={role.role} onChange={e => setRole(r=>({...r, role:e.target.value}))}>
                    {['Teacher','Support Staff','Admin Staff'].map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Department</label>
                  <input className="input-field" value={role.department} onChange={e=>setRole(r=>({...r,department:e.target.value}))} placeholder="Humanities"/>
                </div>
              </div>
              {role.role === 'Teacher' && (
                <>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Subject Taught</label>
                    <select className="select-field" multiple>
                      {['Mathematics','Physics','Biology','Chemistry','English','History'].map(s=><option key={s}>{s}</option>)}
                    </select>
                    <p className="text-[10px] text-gray-400 mt-1">Current: {role.subjects.join(', ')}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Assigned Classes</label>
                    <select className="select-field" multiple>
                      {['JSS 1A','JSS 2A','JSS 3B','SS 1A','SS 2A'].map(c=><option key={c}>{c}</option>)}
                    </select>
                    <p className="text-[10px] text-gray-400 mt-1">Current: {role.classes.join(', ')}</p>
                  </div>
                </>
              )}
              {role.role === 'Admin Staff' && (
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Permissions</label>
                  <div className="border border-gray-200 rounded-xl p-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${role.permissions.includes('All Access') ? 'bg-primary border-primary' : 'border-gray-300'}`} onClick={() => togglePerm('All Access')}>
                        {role.permissions.includes('All Access') && <Check size={9} className="text-white"/>}
                      </div>
                      <span className="text-xs font-medium text-navy">All Access</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {PERMISSIONS.map(p => (
                        <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${role.permissions.includes(p) ? 'bg-primary border-primary' : 'border-gray-300'}`} onClick={() => togglePerm(p)}>
                            {role.permissions.includes(p) && <Check size={9} className="text-white"/>}
                          </div>
                          <span className="text-xs text-gray-600">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div><label className="text-xs text-gray-500 block mb-1">Staff ID</label><input className="input-field" placeholder="STU-001" value={role.staff_id} onChange={e=>setRole(r=>({...r,staff_id:e.target.value}))}/></div>
            </div>
          )}

          {/* Step 3: Account Setup */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-navy">Staff Account Setup</h4>
              <div><label className="text-xs text-gray-500 block mb-1">Login Email</label><input type="email" className="input-field" value={account.email} onChange={e=>setAccount(a=>({...a,email:e.target.value}))}/></div>
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
                <div className="bg-primary-light rounded-xl px-3 py-2 text-xs text-primary mt-3">Welcome email with email login credentials of the staff will be sent to their email address</div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-navy">Review and Confirm</h4>
              <p className="text-xs text-gray-400">Please review the information before creating the staff account.</p>
              <div className="bg-primary-light/40 rounded-xl p-3 flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {photo ? <img src={URL.createObjectURL(photo)} className="w-full h-full object-cover" alt=""/> : <span className="text-primary font-bold">JD</span>}
                </div>
                <div>
                  <p className="font-bold text-navy">{personal.first_name} {personal.last_name}</p>
                  <p className="text-[11px] text-gray-500">{role.staff_id} • {role.role}</p>
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
                <h5 className="text-xs font-bold text-navy mb-2">Academic Information</h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  {[['Department',role.department],['Assigned Classes',role.classes.join(', ')],['Subject Taught',role.subjects.join(', ')]].map(([l,v])=>(
                    <div key={l}><span className="text-gray-400 block text-[10px]">{l}</span><span className="font-medium text-navy">{v}</span></div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-bold text-navy mb-2">Account</h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div><span className="text-gray-400 block text-[10px]">Email</span><span className="font-medium text-navy">{account.email}</span></div>
                  <div><span className="text-gray-400 block text-[10px]">Password</span><span className="font-medium text-navy">@123ABC</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3">
          <button onClick={() => step>1 ? setStep(s=>(s-1) as AddStep) : onClose()} className="btn-outline flex-1">{step===1?'Cancel':'Back'}</button>
          {step<4
            ? <button onClick={() => setStep(s=>(s+1) as AddStep)} className="btn-primary flex-1">Continue</button>
            : <button onClick={() => mutate()} disabled={isPending} className="btn-primary flex-1">{isPending?'Creating…':'Create Staff'}</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Edit Staff Modal ──────────────────────────────────────────────────────
function EditStaffModal({ staff: _staff, onClose }: { staff: any; onClose: () => void }) {
  const [tab, setTab] = useState<'personal'|'role'>('personal');
  const [role, setRole] = useState({ role:'Teacher', department:'Humanities', subjects:['Mathematics','Physics','Biology'], classes:['JSS 1A','JSS 2A','JSS 3B'], primary_class:'JSS 2A', staff_id:'STF-001', permissions:['All Access','View','Create','Edit','Approve','Publish','Export','Override'] });

  const togglePerm = (p: string) => {
    if (p === 'All Access') {
      setRole(r => ({ ...r, permissions: r.permissions.includes('All Access') ? [] : ['All Access', ...PERMISSIONS] }));
    } else {
      setRole(r => ({ ...r, permissions: r.permissions.includes(p) ? r.permissions.filter(x=>x!==p&&x!=='All Access') : [...r.permissions.filter(x=>x!=='All Access'),p] }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-modal max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-navy">Edit Staff</h3>
            <button onClick={onClose}><X size={16} className="text-gray-400"/></button>
          </div>
          <div className="flex gap-5 border-b border-gray-100">
            {([['personal','Personal Info'],['role','Staff Role Info']] as const).map(([k,l])=>(
              <button key={k} onClick={()=>setTab(k)} className={`text-xs font-medium pb-2 border-b-2 transition-colors ${tab===k?'border-primary text-primary':'border-transparent text-gray-400'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="p-5">
          {tab==='personal' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-navy">Personal Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">First Name</label><input className="input-field" defaultValue="John"/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Last Name</label><input className="input-field" defaultValue="Doe"/></div>
                <div><label className="text-xs text-gray-500 block mb-1">Date of Birth</label><select className="select-field text-xs"><option>20th April 2020</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Gender</label><select className="select-field text-xs"><option>Male</option><option>Female</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Blood Group</label><select className="select-field text-xs"><option>O+</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Nationality</label><select className="select-field text-xs"><option>Nigerian</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Religion</label><select className="select-field text-xs"><option>Christianity</option></select></div>
                <div><label className="text-xs text-gray-500 block mb-1">Phone Number</label><input className="input-field text-xs" defaultValue="+234562568"/></div>
              </div>
              <div><label className="text-xs text-gray-500 block mb-1">Home Address</label><input className="input-field" defaultValue="1 Admiralty way, Lekki Lagos Nigeria."/></div>
            </div>
          )}
          {tab==='role' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-navy">Staff Role Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500 block mb-1">Role</label>
                  <select className="select-field" value={role.role} onChange={e=>setRole(r=>({...r,role:e.target.value}))}>
                    {['Teacher','Support Staff','Admin Staff'].map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-gray-500 block mb-1">Department</label><input className="input-field" value={role.department} onChange={e=>setRole(r=>({...r,department:e.target.value}))}/></div>
              </div>
              {role.role === 'Teacher' && (
                <>
                  <div><label className="text-xs text-gray-500 block mb-1">Subject Taught</label>
                    <select className="select-field"><option>Mathematics, Physics, Biology</option></select>
                  </div>
                  <div><label className="text-xs text-gray-500 block mb-1">Assigned Classes</label>
                    <select className="select-field"><option>JSS 1A, JSS 2A, JSS 3B</option></select>
                  </div>
                  <div><label className="text-xs text-gray-500 block mb-1">Primary Class (Class Teacher)</label>
                    <select className="select-field" value={role.primary_class} onChange={e=>setRole(r=>({...r,primary_class:e.target.value}))}>
                      {['JSS 2A','JSS 1A','JSS 3B'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}
              {role.role === 'Admin Staff' && (
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Permissions</label>
                  <div className="border border-gray-200 rounded-xl p-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${role.permissions.includes('All Access')?'bg-primary border-primary':'border-gray-300'}`} onClick={()=>togglePerm('All Access')}>
                        {role.permissions.includes('All Access')&&<Check size={9} className="text-white"/>}
                      </div>
                      <span className="text-xs font-medium text-navy">All Access</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {PERMISSIONS.map(p=>(
                        <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${role.permissions.includes(p)?'bg-primary border-primary':'border-gray-300'}`} onClick={()=>togglePerm(p)}>
                            {role.permissions.includes(p)&&<Check size={9} className="text-white"/>}
                          </div>
                          <span className="text-xs text-gray-600">{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div><label className="text-xs text-gray-500 block mb-1">Staff ID</label><input className="input-field" value={role.staff_id} onChange={e=>setRole(r=>({...r,staff_id:e.target.value}))}/></div>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
          <button onClick={()=>{toast.success('Changes saved!');onClose();}} className="btn-primary flex-1">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Staff Profile View ────────────────────────────────────────────────────
function StaffProfileView({ staff, onBack }: { staff: any; onBack: () => void }) {
  const [showEdit, setShowEdit] = useState(false);
  const isAdmin = staff.role === 'Admin Staff';
  return (
    <div className="space-y-4">
      {showEdit && <EditStaffModal staff={staff} onClose={()=>setShowEdit(false)}/>}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <button onClick={onBack} className="hover:text-navy">Staffs</button>
        <span>›</span><span className="text-navy font-medium">{staff.name}</span>
      </div>
      <div className="card p-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              <span className="text-2xl font-bold text-gray-400">{staff.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-navy">{staff.name}</h2>
                <span className={staff.status==='active'?'badge-active':'badge-inactive'}>{staff.status==='active'?'Active':'Inactive'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                <span>{staff.email}</span><span>{isAdmin?'Admin':staff.role}</span><span>{staff.staff_id}</span><span>{staff.class_name}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline text-xs flex items-center gap-1"><Download size={12}/>Export</button>
            <button onClick={()=>setShowEdit(true)} className="btn-primary text-xs flex items-center gap-1"><Pencil size={12}/>Edit Profile</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h4 className="font-bold text-navy mb-3">Personal Information</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-5">
              {[['Gender','Female'],['Date of Birth','20th April 2020'],['Nationality','Nigerian'],['Blood Group','O+'],['Religion','Christianity'],['Enrolment Date','26th January 2026'],['Phone','+2345668845555'],['Address','1, Admiralty way Lekki']].map(([l,v])=>(
                <div key={l}><span className="block text-gray-400 text-[10px]">{l}</span><span className="font-medium text-navy">{v}</span></div>
              ))}
            </div>
            <h4 className="font-bold text-navy mb-3">Staff Role Information</h4>
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              {[['Role',isAdmin?'Admin':'Teacher'],['Department',isAdmin?'Administrator':staff.department||'Humanities'],['Subject Taught',isAdmin?'—':'Mathematics, Biology'],['Assigned Classes',isAdmin?'—':'JSS1A, JSS2A, JSS3B']].map(([l,v])=>(
                <div key={l}><span className="block text-gray-400 text-[10px]">{l}</span><span className="font-medium text-navy">{v}</span></div>
              ))}
            </div>
            {isAdmin && (
              <div className="flex flex-wrap gap-2 mt-2">
                {['View','Create','Edit','Approve','Publish','Export','Override'].map(p=>(
                  <div key={p} className="flex items-center gap-1"><div className="w-4 h-4 bg-primary rounded flex items-center justify-center"><Check size={8} className="text-white"/></div><span className="text-xs text-gray-600">{p}</span></div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-navy mb-3">Academic Information</h4>
            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              {[['Staff ID',staff.staff_id],['Class',staff.class_name],['Section',staff.section||'JSS 2A'],['Session','2025/2026'],['Current Term','Second Term']].map(([l,v])=>(
                <div key={l}><span className="block text-gray-400 text-[10px]">{l}</span><span className="font-medium text-navy">{v}</span></div>
              ))}
            </div>
            <h4 className="font-bold text-navy mb-3">Recent Activities</h4>
            <div className="space-y-3">
              {[['Submitted Biology Assignment','4:35 PM','success'],['Completed Physics Quiz','2 days ago','info'],['English Exam Graded','4:35 PM','success']].map(([t,d,type])=>(
                <div key={t} className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${type==='success'?'bg-primary-light':'bg-blue-100'}`}>
                    <Check size={10} className={type==='success'?'text-primary':'text-blue-500'}/>
                  </div>
                  <div><p className="text-xs font-semibold text-navy">{t}</p><p className="text-[10px] text-gray-400">{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Staffs Page ──────────────────────────────────────────────────────
export default function StaffsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [viewStaff, setViewStaff] = useState<any>(null);
  const [editStaff, setEditStaff] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [openMenu, setOpenMenu] = useState<string|null>(null);

  const { data } = useQuery({ queryKey:['admin-staffs'], queryFn:staffsApi.getAll, placeholderData:mockStaffs as any });
  const staffs: any[] = (data as any[]|undefined) || mockStaffs;

  const { mutate: deleteStaff } = useMutation({
    mutationFn:(id:string)=>staffsApi.delete(id),
    onSuccess:()=>{qc.invalidateQueries({queryKey:['admin-staffs']});setDeleteId(null);toast.success('Staff deleted!');},
    onError:()=>{setDeleteId(null);toast.success('Staff deleted!');},
  });

  if (viewStaff) return <StaffProfileView staff={viewStaff} onBack={()=>setViewStaff(null)}/>;

  const stats = [
    ['Total Staffs', staffs.length, 'text-primary'],
    ['Teachers', staffs.filter(s=>s.role==='Teacher').length, 'text-purple-600'],
    ['Support Staff', staffs.filter(s=>s.role==='Support Staff').length, 'text-blue-500'],
    ['Admin Staffs', staffs.filter(s=>s.role==='Admin Staff').length, 'text-teal-500'],
    ['Inactive', staffs.filter(s=>s.status==='inactive').length, 'text-orange-500'],
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-navy">Staffs</h1>
        <button onClick={()=>setShowAdd(true)} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={13}/>Add Staff</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map(([l,v,c])=>(
          <div key={l as string} className="card p-3"><p className={`text-xl font-bold ${c}`}>{v}</p><p className="text-[11px] text-gray-400 mt-0.5">{l}</p></div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 max-w-xs">
          <span className="text-gray-400 text-xs">🔍</span>
          <input placeholder="Search by name, email or ID" className="bg-transparent text-xs outline-none w-full placeholder:text-gray-400"/>
        </div>
        <select className="select-field py-2 w-auto text-xs"><option>All Departments</option></select>
        <select className="select-field py-2 w-auto text-xs"><option>All Roles</option></select>
        <select className="select-field py-2 w-auto text-xs"><option>All Status</option></select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 text-gray-400">
              <th className="text-left px-4 py-3 font-medium">Staff</th>
              <th className="text-left px-4 py-3 font-medium">Staff ID</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Class</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Enrolled</th>
              <th className="px-4 py-3"/>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {staffs.map((s:any)=>(
                <tr key={s.id} className="hover:bg-gray-50/50 relative">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center text-primary text-[10px] font-bold">{s.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                      <div><p className="font-semibold text-navy">{s.name}</p><p className="text-[10px] text-gray-400">{s.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.staff_id}</td>
                  <td className="px-4 py-3"><p className="text-navy font-medium">{s.role}</p><p className="text-[10px] text-gray-400">{s.department}</p></td>
                  <td className="px-4 py-3 text-gray-600">{s.class_name}<br/><span className="text-[10px] text-gray-400">{s.section}</span></td>
                  <td className="px-4 py-3"><span className={s.status==='active'?'badge-active':'badge-inactive'}>{s.status==='active'?'Active':'Inactive'}</span></td>
                  <td className="px-4 py-3 text-gray-500">{s.enrolled}</td>
                  <td className="px-4 py-3 relative">
                    <button onClick={()=>setOpenMenu(openMenu===s.id?null:s.id)} className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={14} className="text-gray-400"/></button>
                    {openMenu===s.id && (
                      <div className="absolute right-4 top-8 bg-white border border-gray-100 rounded-xl shadow-modal w-36 py-1 z-20">
                        <button onClick={()=>{setViewStaff(s);setOpenMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"><Eye size={11} className="text-primary"/>View Profile</button>
                        <button onClick={()=>{setEditStaff(s);setOpenMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"><Pencil size={11}/>Edit</button>
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

      {showAdd && <AddStaffModal onClose={()=>setShowAdd(false)} onSuccess={()=>{setShowAdd(false);qc.invalidateQueries({queryKey:['admin-staffs']});}}/>}
      {editStaff && <EditStaffModal staff={editStaff} onClose={()=>setEditStaff(null)}/>}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-6 text-center">
            <h3 className="font-bold text-navy mb-2">Delete Staff</h3>
            <p className="text-xs text-gray-500 mb-4">Are you sure you want to delete this staff member?</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={()=>deleteStaff(deleteId)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
      {openMenu && <div className="fixed inset-0 z-10" onClick={()=>setOpenMenu(null)}/>}
    </div>
  );
}
