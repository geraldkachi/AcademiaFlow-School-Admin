import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Check, Upload, Users } from 'lucide-react';
import { Logo } from '../../components/index';
import { onboardingApi } from '../../api/services';

type Step = 1|2|3|4|5|6;
const STEPS = ['School Info','Documents','Administrator','Academic Setup','Select Plan','Payment'];
const PLANS = [
  { name: 'Basic Plan', price: '₦50,000', students: '200 Students' },
  { name: 'Standard Plan', price: '₦120,000', students: '500 Students' },
  { name: 'Premium Plan', price: '₦250,000', students: '1000 Students' },
  { name: 'Enterprise Plan', price: '₦500,000', students: 'Unlimited Students' },
];

function StepBar({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto pb-1">
      {STEPS.map((label, i) => {
        const n = (i + 1) as Step;
        const done = n < current; const active = n === current;
        return (
          <div key={label} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={done ? 'step-done' : active ? 'step-active' : 'step-inactive'}>
                {done ? <Check size={10}/> : n}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap hidden sm:block ${active||done ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < STEPS.length-1 && <div className={`h-px w-8 sm:w-14 mx-1 mb-3 sm:mb-4 ${done ? 'bg-primary' : 'bg-gray-200'}`}/>}
          </div>
        );
      })}
    </div>
  );
}

function UploadBox({ label, hint }: { label: string; hint: string }) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold text-navy mb-0.5">{label}</p>
      <p className="text-xs text-gray-400 mb-2">{hint}</p>
      <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors">
        <input type="file" className="hidden" accept=".jpg,.png,.pdf" onChange={e => setFile(e.target.files?.[0]||null)}/>
        {file ? (
          <p className="text-xs text-primary font-medium">{file.name}</p>
        ) : (
          <>
            <Upload size={20} className="text-gray-300 mx-auto mb-1"/>
            <p className="text-xs text-gray-400">Upload Document</p>
            <p className="text-[10px] text-gray-300">JPG, PNG or PDF (max 5MB)</p>
          </>
        )}
      </label>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [billing, setBilling] = useState<'monthly'|'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [school, setSchool] = useState({ name: '', institution_type: 'Secondary School', ownership: 'Private', address: '', city: '', state: '', zip: '', country: 'Nigeria' });
  const [admin, setAdmin] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirm_password: '' });
  const [academic, setAcademic] = useState({ academic_year: '2024-2025', students: '250', teachers: '300', classes: '12', terms: '3 Terms' });

  const { mutate: processPayment, isPending: paying } = useMutation({
    mutationFn: onboardingApi.processPayment,
    onSuccess: () => setPaymentSuccess(true),
    onError: () => setPaymentSuccess(true),
  });

  const next = () => setStep(s => Math.min(6, s + 1) as Step);
  const back = () => setStep(s => Math.max(1, s - 1) as Step);

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
        <div className="mb-6"><Logo size="lg"/></div>
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 w-full max-w-2xl p-8">
          <StepBar current={6}/>
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L4 12L20 20L36 12L20 4Z" fill="#0f2d40"/>
                <path d="M6 15.5V24C6 24 10 28 20 28C30 28 34 24 34 24V15.5L20 21.5L6 15.5Z" fill="#16a34a"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-navy mb-3">Payment Successful</h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mb-6">You have successfully subscribed to the AcademiaFlow. Click on the proceed to dashboard button to get started setting up your school.</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary px-8">Proceed to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 py-8">
      <div className="mb-4"><Logo size="lg"/></div>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-navy">Welcome to Academia Flow</h1>
        <p className="text-xs text-gray-400 mt-1">Let's get your school set up in just a few steps</p>
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 w-full max-w-2xl p-6 sm:p-8">
        <StepBar current={step}/>

        {/* Step 1: School Info */}
        {step === 1 && (
          <div>
            <h3 className="font-bold text-navy mb-4">School Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">School Name</label>
                <input className="input-field" placeholder="Spring Info" value={school.name} onChange={e => setSchool(s => ({...s, name: e.target.value}))}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Institution Type</label>
                  <select className="select-field" value={school.institution_type} onChange={e => setSchool(s => ({...s, institution_type: e.target.value}))}>
                    {['Secondary School','Primary School','University','Polytechnic'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">School Ownership</label>
                  <select className="select-field" value={school.ownership} onChange={e => setSchool(s => ({...s, ownership: e.target.value}))}>
                    {['Private','Government','Mission'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Address</label>
                <input className="input-field" placeholder="1 Admiralty way, Lekki Lagos" value={school.address} onChange={e => setSchool(s => ({...s, address: e.target.value}))}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">City/Town</label>
                  <input className="input-field" placeholder="Mushin" value={school.city} onChange={e => setSchool(s => ({...s, city: e.target.value}))}/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">State/Province</label>
                  <input className="input-field" placeholder="Lagos" value={school.state} onChange={e => setSchool(s => ({...s, state: e.target.value}))}/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Zip/Postal code</label>
                  <input className="input-field" placeholder="112234" value={school.zip} onChange={e => setSchool(s => ({...s, zip: e.target.value}))}/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Country</label>
                  <select className="select-field" value={school.country} onChange={e => setSchool(s => ({...s, country: e.target.value}))}>
                    {['Nigeria','Ghana','Kenya','South Africa'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div>
            <h3 className="font-bold text-navy mb-4">Documents</h3>
            <UploadBox label="CAC certificate" hint="Valid Corporate Affairs Commission Certificate"/>
            <UploadBox label="Proprietor Valid ID" hint="NIN, passport, or Driver's Licence"/>
            <UploadBox label="Proof of Address" hint="Electricity Bill, LAWMA Receipt, Tenancy Agreement, or Land Certificate"/>
          </div>
        )}

        {/* Step 3: Administrator */}
        {step === 3 && (
          <div>
            <h3 className="font-bold text-navy mb-4">Administrator Account</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">First Name</label>
                  <input className="input-field" placeholder="John" value={admin.first_name} onChange={e => setAdmin(a => ({...a, first_name: e.target.value}))}/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Last Name</label>
                  <input className="input-field" placeholder="Doe" value={admin.last_name} onChange={e => setAdmin(a => ({...a, last_name: e.target.value}))}/>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Email Address</label>
                <input type="email" className="input-field" placeholder="admin@springhill.com" value={admin.email} onChange={e => setAdmin(a => ({...a, email: e.target.value}))}/>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Phone Number (Optional)</label>
                <input className="input-field" placeholder="07020304050" value={admin.phone} onChange={e => setAdmin(a => ({...a, phone: e.target.value}))}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Password</label>
                  <input type="password" className="input-field" placeholder="••••••••••" value={admin.password} onChange={e => setAdmin(a => ({...a, password: e.target.value}))}/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Confirm Password</label>
                  <input type="password" className="input-field" placeholder="••••••••••" value={admin.confirm_password} onChange={e => setAdmin(a => ({...a, confirm_password: e.target.value}))}/>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Academic Setup */}
        {step === 4 && (
          <div>
            <h3 className="font-bold text-navy mb-4">Academic Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Current Academic Year</label>
                <select className="select-field" value={academic.academic_year} onChange={e => setAcademic(a => ({...a, academic_year: e.target.value}))}>
                  {['2024-2025','2025-2026','2026-2027'].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Number of Students</label>
                  <input type="number" className="input-field" placeholder="250" value={academic.students} onChange={e => setAcademic(a => ({...a, students: e.target.value}))}/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Number of Teachers</label>
                  <input type="number" className="input-field" placeholder="300" value={academic.teachers} onChange={e => setAcademic(a => ({...a, teachers: e.target.value}))}/>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Number of Classes</label>
                <input type="number" className="input-field" placeholder="12" value={academic.classes} onChange={e => setAcademic(a => ({...a, classes: e.target.value}))}/>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Number of Terms/Semester</label>
                <select className="select-field" value={academic.terms} onChange={e => setAcademic(a => ({...a, terms: e.target.value}))}>
                  {['2 Terms','3 Terms','2 Semesters'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="bg-primary-light rounded-xl px-4 py-3 text-xs text-primary">
                You can configure detailed academic structure (classes, subjects, etc.) after completing registration
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Select Plan */}
        {step === 5 && (
          <div>
            <h3 className="font-bold text-navy mb-4">Select Plan</h3>
            <div className="flex gap-2 mb-5 justify-center">
              <button onClick={() => setBilling('monthly')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${billing === 'monthly' ? 'bg-primary text-white' : 'border border-gray-200 text-gray-500'}`}>Monthly</button>
              <button onClick={() => setBilling('annual')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 ${billing === 'annual' ? 'bg-primary text-white' : 'border border-gray-200 text-gray-500'}`}>
                Annual <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">-17%</span>
              </button>
            </div>
            <div className="space-y-3 mb-4">
              {PLANS.map(p => (
                <label key={p.name} className={`flex items-center justify-between px-4 py-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedPlan === p.name ? 'border-primary bg-primary-light/30' : 'border-gray-200 hover:border-primary/40'}`}>
                  <div>
                    <p className="font-bold text-navy text-sm">{p.name}</p>
                    <p className="text-xs text-primary font-semibold">{p.price}{billing === 'annual' ? '/Year' : '/Month'}</p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5"><Users size={10}/>{p.students}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === p.name ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                    {selectedPlan === p.name && <div className="w-2 h-2 bg-white rounded-full"/>}
                  </div>
                  <input type="radio" className="hidden" checked={selectedPlan === p.name} onChange={() => setSelectedPlan(p.name)}/>
                </label>
              ))}
            </div>
            <div className="bg-primary-light rounded-xl px-4 py-2 text-xs text-primary">
              30-day free trial included. No charges until your trial ends. Cancel anytime.
            </div>
          </div>
        )}

        {/* Step 6: Payment */}
        {step === 6 && (
          <div>
            <h3 className="font-bold text-navy mb-4">Payment</h3>
            <div className="border border-gray-200 rounded-xl p-5">
              <h4 className="font-semibold text-navy mb-4">Order Summary</h4>
              <div className="space-y-2 text-sm">
                {[['School Name','Springhills Schools'],['Plan','Starter'],['Billing','Monthly'],['Amount Due','₦50,000'],['Tax','₦102']].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-gray-600"><span>{l}</span><span>{v}</span></div>
                ))}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-navy"><span>Total</span><span>₦50,102</span></div>
              </div>
            </div>
            <div className="bg-primary-light rounded-xl px-4 py-2 text-xs text-primary mt-4">
              You will be redirected to a secure payment gateway to complete your transaction.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
          <button onClick={back} className="btn-outline">Back</button>
          {step === 5 && selectedPlan ? (
            <button onClick={next} className="btn-primary">Continue to Payment</button>
          ) : step === 6 ? (
            <button onClick={() => processPayment()} disabled={paying} className="btn-primary">{paying ? 'Processing…' : 'Proceed to Payment'}</button>
          ) : (
            <button onClick={next} className="btn-outline">{step === 5 && !selectedPlan ? 'Next' : 'Next'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
