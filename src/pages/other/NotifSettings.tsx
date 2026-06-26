import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus, X, CheckCircle2, User, Bell, Lock, Settings as Gear, CreditCard, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationsApi, settingsApi } from '../../api/services';

const mockNotifs = [
  { id:'1', title:'Second Term Mid-Term Exams Schedule', type:'Announcement', message:'Dear students and parents, please note that mid-term examinations are scheduled to begin on March 2, 2026. Students are to come prepared with their exam cards and stationery.', recipients:'All Students & Parents', created_at:'Feb 18, 2026 • 10:30AM', recipients_count:37, read_count:21 },
  { id:'2', title:'Mathematics Assignment Deadline', type:'Reminder', message:"This is a reminder that the Mathematics assignment for Grade 10A is due on February 25, 2026. Please ensure submission before the...", recipients:'JSS 1A Students', created_at:'Feb 18, 2026 • 10:30AM', recipients_count:42, read_count:30 },
  { id:'3', title:'Second Term Mid-Term Exams Schedule', type:'Alert', message:"Attention parents: The deadline for second term school fees is February 28, 2026. Students with outstanding fees will not be allowed to sit for mid-term exams.", recipients:'All Parents', created_at:'Feb 18, 2026 • 10:30AM', recipients_count:102, read_count:80 },
];

const typeBadge = (t: string) => {
  const map: Record<string,string> = { Announcement:'bg-blue-100 text-blue-700', Reminder:'bg-orange-100 text-orange-700', Alert:'bg-red-100 text-red-700' };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[t]||'bg-gray-100 text-gray-600'}`}>{t}</span>;
};

export function NotificationsPage() {
  const [selected, setSelected] = useState<any>(mockNotifs[0]);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [deletedSuccess, setDeletedSuccess] = useState(false);
  const [localNotifs, setLocalNotifs] = useState(mockNotifs);
  const [form, setForm] = useState({ type:'Announcement', title:'', message:'', send_to:'All Students', class_id:'' });

  const { mutate: createNotif, isPending: creating } = useMutation({
    mutationFn: () => notificationsApi.create({ type:form.type, title:form.title, message:form.message, send_to:form.send_to }),
    onSuccess: () => { setShowCreate(false); toast.success('Notification sent!'); },
    onError: () => {
      const n = { id:String(Date.now()), ...form, recipients:form.send_to, created_at:'Just now', recipients_count:0, read_count:0 };
      setLocalNotifs(prev=>[n,...prev]); setShowCreate(false); setSelected(n); toast.success('Notification sent!');
    },
  });

  const { mutate: deleteNotif } = useMutation({
    mutationFn:(id:string)=>notificationsApi.delete(id),
    onSuccess:()=>{ setDeleteId(null); setDeletedSuccess(true); },
    onError:(_,id)=>{ setLocalNotifs(n=>n.filter(x=>x.id!==id)); setDeleteId(null); setDeletedSuccess(true); },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-navy">Notifications</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-wrap gap-2">
            <select className="select-field py-1 w-auto text-xs"><option>All Classes</option></select>
            <button onClick={()=>setShowCreate(true)} className="btn-primary text-xs flex items-center gap-1.5 py-2"><Plus size={12}/>New Notification</button>
          </div>
          <div className="divide-y divide-gray-50">
            {localNotifs.map(n=>(
              <div key={n.id} onClick={()=>setSelected(n)}
                className={`p-4 cursor-pointer transition-colors ${selected?.id===n.id?'bg-primary-light/40':'hover:bg-gray-50'}`}>
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-xs font-semibold text-navy flex-1 pr-2 leading-tight">{n.title}</h4>
                  {typeBadge(n.type)}
                </div>
                <p className="text-[10px] text-gray-500 mb-2 leading-relaxed line-clamp-2">{n.message}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{n.recipients}</span><span>👁 {n.recipients_count}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{n.created_at}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-3 card p-5">
          {selected ? (
            <>
              <div className="mb-1">{typeBadge(selected.type)}</div>
              <h3 className="font-bold text-navy text-base mt-2 mb-3">{selected.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-5">{selected.message}</p>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-gray-50 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-navy">{selected.recipients_count??37}</p><p className="text-xs text-gray-500">Recipients</p></div>
                <div className="bg-primary-light rounded-xl p-4 text-center"><p className="text-2xl font-bold text-primary">{selected.read_count??21}</p><p className="text-xs text-gray-500">Read</p></div>
              </div>
              <div className="mb-4 text-xs">
                <div className="flex items-center justify-between mb-1"><span className="text-gray-400">Read Rate</span><span className="text-primary font-semibold">{selected.recipients_count?Math.round((selected.read_count/selected.recipients_count)*100):80}%</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3"><div className="bg-primary h-2 rounded-full" style={{width:`${selected.recipients_count?Math.round((selected.read_count/selected.recipients_count)*100):80}%`}}/></div>
                <div className="flex items-center justify-between">
                  <div><span className="text-gray-400 block">Sent To</span><span className="font-medium text-navy">{selected.recipients}</span></div>
                  <div className="text-right"><span className="text-gray-400 block">Sent At</span><span className="font-medium text-navy">{selected.created_at}</span></div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>toast.success('Resent!')} className="btn-primary flex-1">Resend</button>
                <button onClick={()=>setDeleteId(selected.id)} className="btn-danger flex-1">Delete</button>
              </div>
            </>
          ) : <div className="text-center text-gray-400 text-sm py-10">Select a notification</div>}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-modal overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-navy">Create New Notification</h3>
              <button onClick={()=>setShowCreate(false)}><X size={16} className="text-gray-400"/></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Notification Type</label>
                <select className="select-field" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  {['Announcement','Reminder','Alert'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Notification Title</label>
                <input className="input-field" placeholder="Mathematics Mock Exam Schedule" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
              </div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Message</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Enter message here" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-2">Send To</label>
                <div className="space-y-2">
                  {['All Students','All Parents','Specific Class','Specific Student'].map(opt=>(
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="send-to" checked={form.send_to===opt} onChange={()=>setForm(f=>({...f,send_to:opt}))} className="accent-primary"/>
                      <span className="text-xs text-gray-700">{opt}</span>
                    </label>
                  ))}
                  {form.send_to==='Specific Class' && (
                    <select className="select-field mt-1" value={form.class_id} onChange={e=>setForm(f=>({...f,class_id:e.target.value}))}>
                      <option>JSS 1A</option><option>JSS 1B</option><option>SS 1A</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={()=>setShowCreate(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={()=>createNotif()} disabled={creating} className="btn-primary flex-1">{creating?'Sending…':'Send Notification'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteId && !deletedSuccess && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-6 text-center">
            <h3 className="font-bold text-navy mb-2">Delete Notification</h3>
            <p className="text-xs text-gray-500 mb-4">Are you sure you want to delete this notification?</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteId(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={()=>deleteNotif(deleteId)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
      {deletedSuccess && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full shadow-modal p-6 text-center">
            <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={24} className="text-primary"/></div>
            <h3 className="font-bold text-navy mb-1">Notification Deleted</h3>
            <p className="text-xs text-gray-500 mb-4">Notification has been deleted.</p>
            <button onClick={()=>{ setDeletedSuccess(false); setSelected(localNotifs[0]); }} className="btn-primary w-full">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────
type SettingsTab = 'profile'|'notification'|'security'|'preference'|'subscription';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={()=>onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${checked?'bg-primary':'bg-gray-200'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked?'translate-x-6':'translate-x-1'}`}/>
    </button>
  );
}

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile');
  const tabs: { key:SettingsTab; label:string; icon:React.ElementType }[] = [
    { key:'profile', label:'Profile', icon:User },
    { key:'notification', label:'Notification', icon:Bell },
    { key:'security', label:'Security', icon:Lock },
    { key:'preference', label:'Preference', icon:Gear },
    { key:'subscription', label:'Subscription', icon:CreditCard },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-navy">Settings</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-48 card p-2 h-fit">
          {tabs.map(({key,label,icon:Icon})=>(
            <button key={key} onClick={()=>setTab(key)}
              className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${tab===key?'bg-primary-light text-primary':'text-gray-500 hover:bg-gray-50'}`}>
              <Icon size={15}/>{label}
            </button>
          ))}
        </div>
        <div className="flex-1 card p-5">
          {tab==='profile' && <ProfileTab/>}
          {tab==='notification' && <NotificationTab/>}
          {tab==='security' && <SecurityTab/>}
          {tab==='preference' && <PreferenceTab/>}
          {tab==='subscription' && <SubscriptionTab/>}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const mockP = { name:'Admin 1', email:'admin@springhills.edu', staff_id:'1H35099', school:'Spring Hills Academy', gender:'Male', phone:'+234568845555', address:'1, Admiralty way Lekki' };
  return (
    <div>
      <h2 className="font-bold text-navy text-center mb-5">Profile</h2>
      <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl mb-5">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center"><User size={20} className="text-gray-400"/></div>
        <div><p className="font-bold text-navy">{mockP.name}</p><div className="flex gap-3 text-[11px] text-gray-400"><span>{mockP.email}</span><span>{mockP.staff_id}</span></div></div>
      </div>
      <h3 className="text-sm font-bold text-navy mb-3">School Information</h3>
      <div className="grid grid-cols-2 gap-4">
        {[['School Name',mockP.school],['Phone',mockP.phone],['Gender',mockP.gender],['Address',mockP.address]].map(([l,v])=>(
          <div key={l}><p className="text-[11px] text-gray-400 mb-0.5">{l}</p><p className="font-medium text-navy text-xs">{v}</p></div>
        ))}
      </div>
    </div>
  );
}

function NotificationTab() {
  const [settings, setSettings] = useState({ new_exam:true, result_published:true, new_assignment:true, graded:true, deadline_reminder:true, school_announcements:true, lead_time:'60 minutes before' });
  const { mutate, isPending } = useMutation({ mutationFn:()=>settingsApi.updateNotifications(settings), onSuccess:()=>toast.success('Saved!') });
  return (
    <div>
      <h2 className="font-bold text-navy text-center mb-5">Notification Settings</h2>
      <div className="space-y-4">
        {[['new_exam','New Exam Scheduled','When a new exam is created'],['result_published','Result Published','When exam results are available'],['new_assignment','New Assignment','Notify when a new assignment is created'],['graded','Assignment Graded','When assignment is graded'],['deadline_reminder','Deadlines & Reminder','Upcoming exam and deadline reminders'],['school_announcements','School Announcements','Receive school-wide announcements']].map(([k,l,d])=>(
          <div key={k} className="flex items-center justify-between gap-4">
            <div><p className="text-sm font-medium text-navy">{l}</p><p className="text-xs text-gray-400">{d}</p></div>
            <Toggle checked={(settings as any)[k]??true} onChange={v=>setSettings(s=>({...s,[k]:v}))}/>
          </div>
        ))}
        <div><label className="block text-sm font-medium text-navy mb-1.5">Deadline Reminder Lead Time</label>
          <select className="select-field" value={settings.lead_time} onChange={e=>setSettings(s=>({...s,lead_time:e.target.value}))}>
            {['15 minutes before','30 minutes before','60 minutes before','2 hours before','1 day before'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <button onClick={()=>mutate()} disabled={isPending} className="btn-primary w-full mt-6">{isPending?'Saving…':'Save'}</button>
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ current:'', new:'', confirm:'' });
  const [show, setShow] = useState({ cur:false, n:false, conf:false });
  const { mutate, isPending } = useMutation({
    mutationFn:()=>settingsApi.updatePassword({ current_password:form.current, new_password:form.new, confirm_password:form.confirm }),
    onSuccess:()=>{ toast.success('Password updated!'); setForm({current:'',new:'',confirm:''}); },
    onError:(e:any)=>toast.error(e?.response?.data?.message||'Failed'),
  });
  return (
    <div>
      <h2 className="font-bold text-navy text-center mb-5">Security Settings</h2>
      <h3 className="text-sm font-semibold text-navy mb-3">Change Password</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {([['current','Current Password','cur'],['new','New Password','n']] as const).map(([k,l,sk])=>(
          <div key={k}><label className="text-xs font-medium text-gray-600 block mb-1">{l}</label>
            <div className="relative">
              <input type={show[sk]?'text':'password'} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="input-field pr-9" placeholder="••••••••"/>
              <button type="button" onClick={()=>setShow(s=>({...s,[sk]:!s[sk]}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show[sk]?<EyeOff size={13}/>:<Eye size={13}/>}</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-5"><label className="text-xs font-medium text-gray-600 block mb-1">Confirm New Password</label>
        <div className="relative">
          <input type={show.conf?'text':'password'} value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} className="input-field pr-9" placeholder="••••••••"/>
          <button type="button" onClick={()=>setShow(s=>({...s,conf:!s.conf}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show.conf?<EyeOff size={13}/>:<Eye size={13}/>}</button>
        </div>
      </div>
      <button onClick={()=>{ if(form.new!==form.confirm)return toast.error('Passwords do not match'); mutate(); }} disabled={isPending} className="btn-primary w-full">{isPending?'Updating…':'Update Password'}</button>
    </div>
  );
}

function PreferenceTab() {
  const [prefs, setPrefs] = useState({ language:'English', timezone:'+1 GMT', date_format:'DD/MM/YYYY', font_size:'Medium' });
  const { mutate, isPending } = useMutation({ mutationFn:()=>settingsApi.updatePreferences(prefs), onSuccess:()=>toast.success('Saved!') });
  return (
    <div>
      <h2 className="font-bold text-navy text-center mb-5">Preferences</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div><label className="text-xs font-medium text-gray-600 block mb-1">Language</label><select className="select-field" value={prefs.language} onChange={e=>setPrefs(p=>({...p,language:e.target.value}))}><option>English</option><option>French</option></select></div>
        <div><label className="text-xs font-medium text-gray-600 block mb-1">Time Zone</label><select className="select-field" value={prefs.timezone} onChange={e=>setPrefs(p=>({...p,timezone:e.target.value}))}><option>+1 GMT</option><option>+2 GMT</option><option>UTC</option></select></div>
        <div><label className="text-xs font-medium text-gray-600 block mb-1">Date Format</label><input className="input-field" value={prefs.date_format} onChange={e=>setPrefs(p=>({...p,date_format:e.target.value}))}/></div>
        <div><label className="text-xs font-medium text-gray-600 block mb-1">Font size</label><select className="select-field" value={prefs.font_size} onChange={e=>setPrefs(p=>({...p,font_size:e.target.value}))}><option>Small</option><option>Medium</option><option>Large</option></select></div>
      </div>
      <button onClick={()=>mutate()} disabled={isPending} className="btn-primary w-full">{isPending?'Saving…':'Save'}</button>
    </div>
  );
}

function SubscriptionTab() {
  return (
    <div>
      <h2 className="font-bold text-navy text-center mb-5">Subscription</h2>
      <div className="border border-primary/20 bg-primary-light/30 rounded-xl p-4 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-navy">Standard Plan</p>
            <p className="text-xs text-gray-500">₦50,000/month</p>
            <p className="text-xs text-primary mt-1">500 Students • 5 Admin Accounts</p>
          </div>
          <span className="badge-active">Active</span>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <p>Next billing date: <span className="font-medium text-navy">March 18, 2026</span></p>
          <p>Member since: <span className="font-medium text-navy">January 18, 2026</span></p>
        </div>
      </div>
      <h3 className="text-sm font-bold text-navy mb-3">Billing History</h3>
      <div className="space-y-2">
        {[['Feb 18, 2026','₦50,000','Paid'],['Jan 18, 2026','₦50,000','Paid'],['Dec 18, 2025','₦50,000','Paid']].map(([date,amount,status])=>(
          <div key={date} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
            <div><p className="text-xs font-medium text-navy">{date}</p><p className="text-[10px] text-gray-400">Standard Plan</p></div>
            <div className="text-right"><p className="text-xs font-bold text-navy">{amount}</p><span className="badge-active text-[10px]">{status}</span></div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-5">
        <button className="btn-outline flex-1">Change Plan</button>
        <button className="btn-danger flex-1">Cancel Subscription</button>
      </div>
    </div>
  );
}
