import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, MoreHorizontal, Check, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { examsApi } from '../../api/services';

const mockExams = [
  { id:'1', title:'Mathematics Finals', subject:'Mathematics', class_name:'SS1', mode:'hall_based' as const, section:'Section A,B,C', schedule:'Jan 15, 2026\n02:00 PM – 04:00 PM', duration:90, status:'scheduled' as const, questions:60, marks:100 },
  { id:'2', title:'Biology Practical Assessment', subject:'Biology', class_name:'SS3', mode:'online' as const, section:'Section B', schedule:'Feb 20, 2026\n02:00 PM – 04:00 PM', duration:120, status:'scheduled' as const, questions:50, marks:80 },
  { id:'3', title:'Physics Quiz 3', subject:'Physics', class_name:'JSS2', mode:'hall_based' as const, section:'Section A', schedule:'Mar 8, 2026\n10:00 AM – 11:30 AM', duration:90, status:'scheduled' as const, questions:30, marks:30 },
  { id:'4', title:'English Mid-Term', subject:'English', class_name:'JSS3', mode:'online' as const, section:'Section A,B,C', schedule:'Feb 25, 2026\n10:00 AM – 11:00 AM', duration:120, status:'pending_review' as const, questions:40, marks:60 },
  { id:'5', title:'Government Mock Exam', subject:'Government', class_name:'SS3', mode:'hall_based' as const, section:'Section A,B,C', schedule:'Jan 29, 2026\n09:00 AM – 11:00 AM', duration:90, status:'pending_review' as const, questions:80, marks:100 },
  { id:'6', title:'Chemistry Test', subject:'Chemistry', class_name:'JSS1', mode:'online' as const, section:'Section C', schedule:'Feb 12, 2026\n09:00 AM – 11:00 AM', duration:120, status:'completed' as const, questions:30, marks:30 },
  { id:'7', title:'Commerce Mid-term', subject:'Commerce', class_name:'SS1', mode:'hall_based' as const, section:'Section A', schedule:'Mar 13, 2026\n10:00 AM – 01:00 AM', duration:90, status:'completed' as const, questions:15, marks:30 },
  { id:'8', title:'Accounting Mock Exam', subject:'Accounting', class_name:'SS2', mode:'online' as const, section:'Section A', schedule:'Mar 22, 2026\n09:00 AM – 11:00 AM', duration:120, status:'rejected' as const, questions:80, marks:100 },
];

const mockReviewExam = {
  title:'Maths Finals Exam', subject:'Mathematics', class_name:'JSS 2', section:'JSS 2A, B, C',
  duration:'60 mins', exam_date:'20 Mar, 2026', start_time:'09:00 AM', end_time:'10:00 AM',
  access_code:'EX-OVI5I5', questions_count:1, total_marks:1, pass_mark:'50%', mode:'Online',
  submitted_by:{ name:'Jameson Black', date:'5 months on Feb 9, 2026' },
  security:['Token Window Restricted','Auto Submit on timeout','Randomize questions','Randomize options','Copy-paste disabled'],
  questions:[
    { id:'1', type:'MCQ', marks:2, text:"Which of the following is Newton's Second Law of Motion?", options:['An object at rest stays at rest unless acted upon by an external force','F = ma (Force equals mass times acceleration)','For every action, there is an equal and opposite reaction','Energy cannot be created or destroyed'], correct:'B' },
    { id:'2', type:'MCQ', marks:1, text:'What is the SI unit of electric current?', options:['A. Volt','B. Watt','C. Ampere','D. Ohm'], correct:'C' },
    { id:'3', type:'TrueFalse', marks:1, text:'What is the SI unit of electric current?', options:['True','False'], correct:'False' },
    { id:'4', type:'ShortAnswer', marks:1, text:'State the principle of conservation of momentum.' },
  ],
};

type ExamStep = 1|2|3|4|5;
const EXAM_STEPS = ['Exam Details','Exam Mode','Questions','Security','Review'];

const statusBadge = (s: string) => {
  const map:Record<string,string> = { scheduled:'badge-active', pending_review:'badge-inactive', completed:'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700', rejected:'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600' };
  const labels:Record<string,string> = { scheduled:'Scheduled', pending_review:'Pending Review', completed:'Completed', rejected:'Rejected' };
  return <span className={map[s]||'badge-inactive'}>{labels[s]||s}</span>;
};

const typeBadge = (t: string) => {
  const map:Record<string,string> = { MCQ:'bg-purple-100 text-purple-700', TrueFalse:'bg-blue-100 text-blue-700', ShortAnswer:'bg-orange-100 text-orange-700' };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${map[t]||'bg-gray-100 text-gray-600'}`}>{t==='TrueFalse'?'TrueFalse':t}</span>;
};

// ─── Create Exam Wizard ────────────────────────────────────────────────────
function CreateExamPage({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<ExamStep>(1);
  const [step1, setStep1] = useState({ title:'', subject:'', class_name:'', sections:[] as string[], duration:'60', pass_mark:'50', instructions:'' });
  const [step2, setStep2] = useState({ mode:'hall_based' as 'hall_based'|'online', exam_center:'Main CBT Center', hall:'HALL A (Capacity: 40)', exam_date:'', start_time:'', ip_range:'', early_login:'5 minutes', seat_assignment:'auto' as 'auto'|'manual', csv_file:null as File|null, online_date:'20 Mar, 2026', online_time:'09:00 AM', access_code:'EX-OVIS5' });
  const [questions, setQuestions] = useState([{ id:'1', type:'MCQ', text:'', marks:'1', options:['','','',''], correct:'' }]);
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [security, setSecurity] = useState({ token_validation:true, allow_early_login:true, auto_submit:true, randomize_order:true, disable_copy_paste:true, enforce_fullscreen:true });
  const [examCreated, setExamCreated] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn:()=>examsApi.approve('new'),
    onSuccess:()=>setExamCreated(true),
    onError:()=>setExamCreated(true),
  });

  const toggleSection = (s:string) => setStep1(p=>({...p,sections:p.sections.includes(s)?p.sections.filter(x=>x!==s):[...p.sections,s]}));
  const addQ = () => { setQuestions(q=>[...q,{id:String(Date.now()),type:'MCQ',text:'',marks:'1',options:['','','',''],correct:''}]); setActiveQIdx(questions.length); };
  const updateQ = (i:number, patch:any) => setQuestions(q=>q.map((item,qi)=>qi===i?{...item,...patch}:item));
  const aq = questions[activeQIdx]||questions[0];

  // Summary sidebar
  const SummarySidebar = () => (
    <div className="card p-4 text-xs space-y-2">
      <h4 className="font-bold text-navy text-sm">Exam Summary</h4>
      <div className="grid grid-cols-2 gap-y-2">
        <div><span className="text-gray-400 block">Subject</span><span className="font-medium text-navy">{step1.subject||'Mathematics'}</span></div>
        <div><span className="text-gray-400 block">Class</span><span className="font-medium text-navy">{step1.class_name||'JSS 2'}</span></div>
        <div><span className="text-gray-400 block">Section</span><span className="font-medium text-navy">{step1.sections.join(', ')||'JSS 2A, B, C'}</span></div>
        <div><span className="text-gray-400 block">Duration</span><span className="font-medium text-navy">{step1.duration?`${step1.duration} mins`:'60 mins'}</span></div>
        {step2.mode==='hall_based' && step2.hall && <><div><span className="text-gray-400 block">Hall</span><span className="font-medium text-navy">{step2.hall}</span></div></>}
        {(step2.online_date||step2.exam_date) && <div><span className="text-gray-400 block">Exam Date</span><span className="font-medium text-navy">{step2.mode==='online'?step2.online_date:step2.exam_date}</span></div>}
        {(step2.online_time||step2.start_time) && <div><span className="text-gray-400 block">Start Time</span><span className="font-medium text-navy">{step2.mode==='online'?step2.online_time:step2.start_time}</span></div>}
        {step2.mode==='online' && step2.access_code && <div className="col-span-2"><span className="text-gray-400 block">Access Code</span><span className="font-medium text-navy">{step2.access_code}</span></div>}
        {questions.length>0 && step>=3 && <>
          <div><span className="text-gray-400 block">Questions</span><span className="font-medium text-navy">{questions.length}</span></div>
          <div><span className="text-gray-400 block">Total Marks</span><span className="font-medium text-navy">{questions.reduce((a,q)=>a+Number(q.marks),0)}</span></div>
        </>}
      </div>
    </div>
  );

  if (examCreated) {
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-6 text-center">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 3L3 8V15C3 20.5 8.7 25.5 16 27C23.3 25.5 29 20.5 29 15V8L16 3Z" fill="#dcfce7"/><path d="M11 16l4 4 7-7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h3 className="font-bold text-navy mb-1">Exam Created</h3>
          <p className="text-xs text-gray-500 mb-4">Maths Finals Exam has been successfully created and scheduled</p>
          <button onClick={onBack} className="btn-primary w-full">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <button onClick={onBack} className="hover:text-navy">Exams</button>
        <span>›</span><span className="text-navy font-medium">Create Exam</span>
      </div>
      <h1 className="text-lg font-bold text-navy">Create Exam</h1>
      <div className="card p-5">
        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-6 overflow-x-auto pb-1">
          {EXAM_STEPS.map((label,i)=>{
            const n=(i+1) as ExamStep; const done=n<step; const active=n===step;
            return (
              <div key={label} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className={done?'step-done':active?'step-active':'step-inactive'}>{done?<Check size={10}/>:n}</div>
                  <span className={`text-[10px] whitespace-nowrap hidden sm:block ${active||done?'text-primary':'text-gray-400'}`}>{label}</span>
                </div>
                {i<4 && <div className={`h-px w-8 sm:w-14 mx-1 mb-3 sm:mb-4 ${done?'bg-primary':'bg-gray-200'}`}/>}
              </div>
            );
          })}
        </div>

        <div className={`grid gap-5 ${step===5?'grid-cols-1':'grid-cols-1 lg:grid-cols-3'}`}>
          <div className={step===5?'':'lg:col-span-2'}>

            {/* Step 1 */}
            {step===1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-navy">Exam Details</h3>
                <div><label className="text-xs text-gray-500 block mb-1">Exam Title</label><input className="input-field" placeholder="Maths Final exams" value={step1.title} onChange={e=>setStep1(p=>({...p,title:e.target.value}))}/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 block mb-1">Subject</label>
                    <select className="select-field" value={step1.subject} onChange={e=>setStep1(p=>({...p,subject:e.target.value}))}>
                      <option value="">Select Subject</option>
                      {['Mathematics','Physics','Chemistry','Biology','English','Government','Commerce'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs text-gray-500 block mb-1">Class</label>
                    <select className="select-field" value={step1.class_name} onChange={e=>setStep1(p=>({...p,class_name:e.target.value}))}>
                      <option value="">JSS1</option>
                      {['JSS1','JSS2','JSS3','SS1','SS2','SS3'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-2">Sections</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Section A','Section B','Section C'].map(s=>(
                      <button key={s} type="button" onClick={()=>toggleSection(s)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${step1.sections.includes(s)?'bg-primary text-white border-primary':'border-gray-200 text-gray-600 hover:border-primary/40'}`}>
                        {step1.sections.includes(s)&&<Check size={10}/>}{s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 block mb-1">Duration (minutes)</label><input type="number" className="input-field" value={step1.duration} onChange={e=>setStep1(p=>({...p,duration:e.target.value}))} placeholder="60"/></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Pass Mark (%)</label><input type="number" className="input-field" value={step1.pass_mark} onChange={e=>setStep1(p=>({...p,pass_mark:e.target.value}))} placeholder="50"/></div>
                </div>
                <div><label className="text-xs text-gray-500 block mb-1">Instructions for Students</label><textarea className="input-field resize-none" rows={2} placeholder="Answer all Questions" value={step1.instructions} onChange={e=>setStep1(p=>({...p,instructions:e.target.value}))}/></div>
              </div>
            )}

            {/* Step 2 */}
            {step===2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-navy">Exam Mode</h3>
                <div className="flex gap-3 flex-wrap">
                  {(['hall_based','online'] as const).map(m=>(
                    <label key={m} className={`flex items-center gap-2 border-2 rounded-xl px-4 py-2.5 cursor-pointer transition-colors ${step2.mode===m?'border-primary bg-primary-light':'border-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${step2.mode===m?'border-primary bg-primary':'border-gray-300'}`}>{step2.mode===m&&<div className="w-2 h-2 bg-white rounded-full"/>}</div>
                      <input type="radio" className="hidden" checked={step2.mode===m} onChange={()=>setStep2(p=>({...p,mode:m}))}/>
                      <span className="text-xs font-semibold text-navy">{m==='hall_based'?'Hall-Based (On-Site)':'Online'}</span>
                    </label>
                  ))}
                </div>
                {step2.mode==='hall_based' && (
                  <>
                    <h4 className="text-sm font-semibold text-navy">Hall Assignment</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-gray-500 block mb-1">Exam Center</label><select className="select-field" value={step2.exam_center} onChange={e=>setStep2(p=>({...p,exam_center:e.target.value}))}><option>Main CBT Center</option><option>Annex</option></select></div>
                      <div><label className="text-xs text-gray-500 block mb-1">Hall</label><select className="select-field" value={step2.hall} onChange={e=>setStep2(p=>({...p,hall:e.target.value}))}><option>HALL A (Capacity: 40)</option><option>HALL B</option></select></div>
                      <div><label className="text-xs text-gray-500 block mb-1">Exam Date</label><input type="date" className="input-field" value={step2.exam_date} onChange={e=>setStep2(p=>({...p,exam_date:e.target.value}))}/></div>
                      <div><label className="text-xs text-gray-500 block mb-1">Start Time</label><input type="time" className="input-field" value={step2.start_time} onChange={e=>setStep2(p=>({...p,start_time:e.target.value}))}/></div>
                      <div><label className="text-xs text-gray-500 block mb-1">IP Range</label><input className="input-field" placeholder="192.168.10/24" value={step2.ip_range} onChange={e=>setStep2(p=>({...p,ip_range:e.target.value}))}/></div>
                      <div><label className="text-xs text-gray-500 block mb-1">Early Login</label><select className="select-field" value={step2.early_login} onChange={e=>setStep2(p=>({...p,early_login:e.target.value}))}>{['5 minutes','10 minutes','15 minutes','30 minutes'].map(o=><option key={o}>{o}</option>)}</select></div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-navy mb-2">Seat Assignment</h4>
                      <div className="flex gap-3">
                        {([['auto','Auto-Assign','System assigns seats alphabetically by name'],['manual','Manual CVS','Upload a student seat mapping CVS']] as const).map(([val,label,desc])=>(
                          <label key={val} className={`flex-1 border-2 rounded-xl p-3 cursor-pointer transition-colors ${step2.seat_assignment===val?'border-primary bg-primary-light/30':'border-gray-200'}`}>
                            <div className="flex items-start gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${step2.seat_assignment===val?'border-primary bg-primary':'border-gray-300'}`}/>
                              <input type="radio" className="hidden" checked={step2.seat_assignment===val} onChange={()=>setStep2(p=>({...p,seat_assignment:val}))}/>
                              <div><p className="text-xs font-semibold text-navy">{label}</p><p className="text-[10px] text-gray-400">{desc}</p></div>
                            </div>
                            {val==='manual'&&step2.seat_assignment==='manual'&&(
                              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                <input type="file" className="hidden" accept=".csv" onChange={e=>setStep2(p=>({...p,csv_file:e.target.files?.[0]||null}))}/>
                                <span className="text-xs text-primary font-medium">{step2.csv_file?<span className="flex items-center gap-1">{step2.csv_file.name}<button type="button" onClick={()=>setStep2(p=>({...p,csv_file:null}))}><X size={10}/></button></span>:'Choose File'}</span>
                              </label>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {step2.mode==='online' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-navy">Online Setup</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-gray-500 block mb-1">Exam Date</label><input type="date" className="input-field" onChange={e=>setStep2(p=>({...p,online_date:e.target.value}))}/></div>
                      <div><label className="text-xs text-gray-500 block mb-1">Start Time</label><input type="time" className="input-field" onChange={e=>setStep2(p=>({...p,online_time:e.target.value}))}/></div>
                    </div>
                    <div><label className="text-xs text-gray-500 block mb-1">Access Code <span className="text-gray-400 font-normal">(student enter this to access exam)</span></label>
                      <input className="input-field" value={step2.access_code} onChange={e=>setStep2(p=>({...p,access_code:e.target.value}))}/></div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Questions */}
            {step===3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-navy">Add Question</h3>
                {questions.map((q,i)=>i!==activeQIdx&&(
                  <div key={q.id} className="border border-gray-100 rounded-xl p-3 flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-bold">{i+1}</span>
                        {typeBadge(q.type)}
                        <span className="text-[10px] text-gray-400">{q.marks}M</span>
                      </div>
                      <p className="text-xs text-navy">{q.text||'Question text…'}</p>
                    </div>
                    <button onClick={()=>setActiveQIdx(i)} className="p-1 hover:bg-gray-100 rounded text-xs">✏</button>
                  </div>
                ))}
                {/* Active question form */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400">{activeQIdx+1}</span>
                    {typeBadge(aq.type)}<span className="text-[10px] text-gray-400">{aq.marks}M</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] text-gray-400 block mb-1">Question Type</label>
                      <select className="select-field text-xs" value={aq.type} onChange={e=>{const t=e.target.value;updateQ(activeQIdx,{type:t,options:t==='TrueFalse'?['True','False']:t==='MCQ'?['','','','']:[],correct:''});}}>
                        <option value="MCQ">Multiple Choice (MCQ)</option>
                        <option value="TrueFalse">True or False</option>
                        <option value="ShortAnswer">Short Answer</option>
                      </select>
                    </div>
                    <div><label className="text-[10px] text-gray-400 block mb-1">Mark per question</label>
                      <input className="input-field text-xs" placeholder="1 mark" value={aq.marks} onChange={e=>updateQ(activeQIdx,{marks:e.target.value})}/>
                    </div>
                  </div>
                  <div><label className="text-[10px] text-gray-400 block mb-1">Question Text</label>
                    <textarea className="input-field text-xs resize-none" rows={2} placeholder="Enter your Question" value={aq.text} onChange={e=>updateQ(activeQIdx,{text:e.target.value})}/>
                  </div>
                  {aq.type!=='ShortAnswer' && (
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-2">Answer Options <span className="text-gray-300">(select correct one)</span></label>
                      <div className="space-y-2">
                        {aq.options.map((opt:string,oi:number)=>(
                          <label key={oi} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${aq.correct===opt&&opt?'border-primary bg-primary-light':'border-gray-200 bg-white'}`}>
                            <input type="radio" name={`q-${activeQIdx}`} checked={aq.correct===opt&&!!opt} onChange={()=>opt&&updateQ(activeQIdx,{correct:opt})} className="accent-primary"/>
                            {aq.type==='TrueFalse'
                              ? <span className="text-xs text-gray-700">{opt}</span>
                              : <input className="flex-1 text-xs bg-transparent outline-none" placeholder={`Option ${oi+1}`} value={opt}
                                  onChange={e=>{const newOpts=[...aq.options];newOpts[oi]=e.target.value;updateQ(activeQIdx,{options:newOpts});}}/>
                            }
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={addQ} className="btn-primary text-xs flex items-center gap-1.5 py-2"><Plus size={13}/>Add Question</button>
              </div>
            )}

            {/* Step 4: Security */}
            {step===4 && (
              <div className="space-y-5">
                <h4 className="text-sm font-semibold text-navy">Token & Time Window</h4>
                {[{key:'token_validation',label:'Token Validation during exam window only',desc:"Students cannot use their token outside the scheduled exam time"},{key:'allow_early_login',label:'Allow early login',desc:'Student can log in before the exam starts to settle in'}].map(({key,label,desc})=>(
                  <div key={key} className="flex items-center justify-between gap-4">
                    <div><p className="text-xs font-medium text-navy">{label}</p><p className="text-[10px] text-gray-400">{desc}</p></div>
                    <button type="button" onClick={()=>setSecurity(s=>({...s,[key]:!(s as any)[key]}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${(security as any)[key]?'bg-primary':'bg-gray-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${(security as any)[key]?'translate-x-6':'translate-x-1'}`}/>
                    </button>
                  </div>
                ))}
                <h4 className="text-sm font-semibold text-navy">Exam Behaviour</h4>
                {[{key:'auto_submit',label:'Auto-submit on timeout',desc:'Automatically submits when the timer reaches zero'},{key:'randomize_order',label:'Randomize question order',desc:'each student gets questions in a different order'},{key:'disable_copy_paste',label:'Disable copy-paste',desc:'prevents students from pasting text into answers'},{key:'enforce_fullscreen',label:'Enforce fullscreen mode',desc:'Warns students if they leave Fullscreen'}].map(({key,label,desc})=>(
                  <div key={key} className="flex items-center justify-between gap-4">
                    <div><p className="text-xs font-medium text-navy">{label}</p><p className="text-[10px] text-gray-400">{desc}</p></div>
                    <button type="button" onClick={()=>setSecurity(s=>({...s,[key]:!(s as any)[key]}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${(security as any)[key]?'bg-primary':'bg-gray-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${(security as any)[key]?'translate-x-6':'translate-x-1'}`}/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Step 5: Review */}
            {step===5 && (
              <div className="space-y-4">
                <h3 className="font-bold text-navy text-base">{step1.title||'Maths Finals Exam'}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[['Subject',step1.subject||'Mathematics'],['Class',step1.class_name||'JSS 2'],['Section',step1.sections.join(', ')||'JSS 2A, B, C'],['Duration',`${step1.duration||60} mins`],['Exam Date',step2.mode==='online'?step2.online_date:step2.exam_date||'20 Mar, 2026'],['Start Time',step2.mode==='online'?step2.online_time:step2.start_time||'09:00 AM'],['End Time','10:00 AM'],['Access Code',step2.access_code||'EX-OVIS5'],['Questions',String(questions.length)],['Total Marks',String(questions.reduce((a,q)=>a+Number(q.marks),0))],['Pass mark',`${step1.pass_mark||50}%`],['Mode',step2.mode==='online'?'Online':'Hall Based']].map(([l,v])=>(
                    <div key={l}><p className="text-gray-400 text-[10px]">{l}</p><p className="font-semibold text-navy">{v}</p></div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {step<5 && <SummarySidebar/>}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button onClick={()=>step>1?setStep(s=>(s-1) as ExamStep):onBack()} className="btn-outline">Back</button>
          {step===5 ? (
            <div className="flex gap-3">
              <button onClick={()=>toast.success('Saved as draft!')} className="btn-outline">Save as Draft</button>
              <button onClick={()=>mutate()} disabled={isPending} className="btn-primary">{isPending?'Scheduling…':'Schedule Exam'}</button>
            </div>
          ) : (
            <button onClick={()=>setStep(s=>(s+1) as ExamStep)} className="btn-primary">Continue</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pending Review Detail ─────────────────────────────────────────────────
function PendingReviewDetail({ exam, onBack }: { exam: any; onBack: () => void }) {
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(false);
  const [approved, setApproved] = useState(false);
  const { mutate: approveExam } = useMutation({ mutationFn:()=>examsApi.approve(exam.id), onSuccess:()=>setApproved(true), onError:()=>setApproved(true) });
  const { mutate: rejectExam } = useMutation({ mutationFn:()=>examsApi.reject(exam.id,'Needs revision'), onSuccess:()=>{toast.success('Exam rejected');onBack();}, onError:()=>{toast.success('Exam rejected');onBack();} });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <button onClick={onBack} className="hover:text-navy">Exams</button>
        <span>›</span><span className="text-navy font-medium">Review: English Mid-Term</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-navy text-base mb-4">{mockReviewExam.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-5">
              {[['Subject',mockReviewExam.subject],['Class',mockReviewExam.class_name],['Section',mockReviewExam.section],['Duration',mockReviewExam.duration],['Exam Date',mockReviewExam.exam_date],['Start Time',mockReviewExam.start_time],['End Time',mockReviewExam.end_time],['Access Code',mockReviewExam.access_code],['Questions',String(mockReviewExam.questions_count)],['Total Marks',String(mockReviewExam.total_marks)],['Pass mark',mockReviewExam.pass_mark],['Mode',mockReviewExam.mode]].map(([l,v])=>(
                <div key={l}><p className="text-gray-400 text-[10px]">{l}</p><p className="font-semibold text-navy">{v}</p></div>
              ))}
            </div>
            {/* Questions preview */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="text-sm font-bold text-navy">Questions Preview</h3><p className="text-[10px] text-gray-400">Showing 6 of 40 questions · 10 marks</p></div>
                <span className="text-[10px] text-gray-400">Randomized in actual exam</span>
              </div>
              <div className="space-y-4">
                {mockReviewExam.questions.map((q,i)=>(
                  <div key={q.id} className="border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2"><span className="text-xs text-gray-400 font-bold">{i+1}</span>{typeBadge(q.type)}<span className="text-[10px] text-gray-400">{q.marks}M</span></div>
                    <p className="text-sm text-navy mb-3">{q.text}</p>
                    {q.type==='MCQ'&&q.options&&(
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt:string,oi:number)=>(
                          <div key={oi} className={`text-xs px-3 py-2 rounded-lg border ${oi===1||opt.includes('F = ma')||opt==='C. Ampere'?'bg-primary-light border-primary/20 text-primary':'border-gray-100 text-gray-600'}`}>{opt}</div>
                        ))}
                      </div>
                    )}
                    {q.type==='TrueFalse'&&<div className="flex gap-3">{['True','False'].map(v=><div key={v} className={`text-xs px-4 py-1.5 rounded-lg border font-medium ${v==='True'?'bg-primary-light border-primary/20 text-primary':'border-gray-200 text-gray-500'}`}>{v}</div>)}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Security */}
          <div className="card p-4">
            <h4 className="text-sm font-bold text-navy mb-3">Security Rules</h4>
            <div className="space-y-2">
              {mockReviewExam.security.map(rule=>(
                <div key={rule} className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle2 size={13} className="text-primary shrink-0"/>{rule}</div>
              ))}
            </div>
          </div>
          {/* Submitted by */}
          <div className="card p-4">
            <h4 className="text-sm font-bold text-navy mb-2">Submitted By</h4>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-primary font-bold text-xs">JB</div>
              <div><p className="text-xs font-semibold text-navy">{mockReviewExam.submitted_by.name}</p><p className="text-[10px] text-gray-400">{mockReviewExam.submitted_by.date}</p></div>
            </div>
            <p className="text-[11px] font-semibold text-orange-500 mt-3">Status: Pending</p>
            <div className="flex gap-2 mt-3">
              <button onClick={()=>setApproveConfirm(true)} className="btn-primary flex-1 text-xs py-2">Approve</button>
              <button onClick={()=>setRejectConfirm(true)} className="btn-danger flex-1 text-xs py-2">Reject</button>
            </div>
          </div>
        </div>
      </div>

      {/* Approve confirm */}
      {approveConfirm && !approved && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-6 text-center">
            <h3 className="font-bold text-navy mb-2">Approve Exam</h3>
            <p className="text-xs text-gray-500 mb-4">Are you sure you want to approve this exam? Once approved the exam will be scheduled.</p>
            <div className="flex gap-3">
              <button onClick={()=>setApproveConfirm(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={()=>{setApproveConfirm(false);approveExam();}} className="btn-primary flex-1">Approve</button>
            </div>
          </div>
        </div>
      )}
      {approved && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-6 text-center">
            <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={24} className="text-primary"/></div>
            <h3 className="font-bold text-navy mb-1">Exam Approved</h3>
            <p className="text-xs text-gray-500 mb-4">The exam has been approved and scheduled.</p>
            <button onClick={()=>{setApproved(false);onBack();}} className="btn-primary w-full">Done</button>
          </div>
        </div>
      )}
      {rejectConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-6 text-center">
            <h3 className="font-bold text-navy mb-2">Reject Exam</h3>
            <p className="text-xs text-gray-500 mb-3">Are you sure you want to reject this exam?</p>
            <textarea className="input-field text-xs resize-none mb-3" rows={2} placeholder="Rejection reason…"/>
            <div className="flex gap-3">
              <button onClick={()=>setRejectConfirm(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={()=>{setRejectConfirm(false);rejectExam();}} className="btn-danger flex-1">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Exams Page ───────────────────────────────────────────────────────
export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState('All Exams');
  const [showCreate, setShowCreate] = useState(false);
  const [reviewExam, setReviewExam] = useState<any>(null);
  const [openMenu, setOpenMenu] = useState<string|null>(null);

  const { data } = useQuery({ queryKey:['admin-exams'], queryFn:examsApi.getAll, placeholderData:mockExams as any });
  const exams: any[] = (data as any[]|undefined)||mockExams;

  const filtered = activeTab==='Pending Reviews' ? exams.filter(e=>e.status==='pending_review')
    : activeTab==='Scheduled' ? exams.filter(e=>e.status==='scheduled') : exams;

  if (showCreate) return <CreateExamPage onBack={()=>setShowCreate(false)}/>;
  if (reviewExam) return <PendingReviewDetail exam={reviewExam} onBack={()=>setReviewExam(null)}/>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-navy">Exams</h1>
        <button onClick={()=>setShowCreate(true)} className="btn-primary text-xs flex items-center gap-1.5"><Plus size={13}/>Create Exam</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[['Total Exams',exams.length,'text-primary'],['Hall-Based',exams.filter(e=>e.mode==='hall_based').length,'text-purple-600'],['Online',exams.filter(e=>e.mode==='online').length,'text-blue-600'],['Pending Review',exams.filter(e=>e.status==='pending_review').length,'text-orange-500'],['Scheduled',exams.filter(e=>e.status==='scheduled').length,'text-teal-500']].map(([l,v,c])=>(
          <div key={l as string} className="card p-3"><p className={`text-xl font-bold ${c}`}>{v}</p><p className="text-[11px] text-gray-400 mt-0.5">{l}</p></div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {['All Exams','Pending Reviews','Scheduled'].map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            className={`text-sm font-medium pb-2 px-3 border-b-2 transition-colors ${activeTab===t?'border-primary text-primary':'border-transparent text-gray-400 hover:text-navy'}`}>
            {t}{t==='Pending Reviews'&&<span className="ml-1 bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{exams.filter(e=>e.status==='pending_review').length}</span>}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-2">
          <div className="flex-1 max-w-xs flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <span className="text-gray-400 text-xs">🔍</span>
            <input placeholder="Search by name, subject" className="bg-transparent text-xs outline-none w-full placeholder:text-gray-400"/>
          </div>
          <select className="select-field py-1.5 w-auto text-xs"><option>All Status</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100 text-gray-400">
              <th className="text-left px-4 py-2.5 font-medium">Exam</th>
              <th className="text-left px-4 py-2.5 font-medium">Class</th>
              <th className="text-left px-4 py-2.5 font-medium">Mode</th>
              <th className="text-left px-4 py-2.5 font-medium">Schedule</th>
              <th className="text-left px-4 py-2.5 font-medium">Duration</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5"/>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((ex:any)=>(
                <tr key={ex.id} className="hover:bg-gray-50/50 relative">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{ex.title}</p>
                    <p className="text-[10px] text-gray-400">{ex.subject} · {ex.questions}Qs · {ex.marks} marks</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ex.class_name}<br/><span className="text-[10px] text-gray-400">{ex.section}</span></td>
                  <td className="px-4 py-3"><span className={ex.mode==='online'?'badge-online':'badge-hallbased'}>{ex.mode==='online'?'Online':'Hall-Based'}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-[10px] whitespace-pre-line">{ex.schedule}</td>
                  <td className="px-4 py-3 text-gray-600">{ex.duration} Minutes</td>
                  <td className="px-4 py-3">{statusBadge(ex.status)}</td>
                  <td className="px-4 py-3 relative">
                    <button onClick={()=>setOpenMenu(openMenu===ex.id?null:ex.id)} className="p-1 hover:bg-gray-100 rounded"><MoreHorizontal size={14} className="text-gray-400"/></button>
                    {openMenu===ex.id && (
                      <div className="absolute right-4 top-8 bg-white border border-gray-100 rounded-xl shadow-modal w-32 py-1 z-20">
                        {ex.status==='pending_review' && <button onClick={()=>{setReviewExam(ex);setOpenMenu(null);}} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">📋 Review</button>}
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50">👁 View</button>
                        <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50">🗑 Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {openMenu && <div className="fixed inset-0 z-10" onClick={()=>setOpenMenu(null)}/>}
    </div>
  );
}
