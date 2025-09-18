import React, { useState } from "react";
import styled from "styled-components";
import { InnerLayout } from "../../styles/Layouts";
import hero from "../../img/hero.png";

function EmergencyForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", age: "", location: "", symptoms: "", notes: "" });

  return (
    <Page>
      <InnerLayout>
        <div className="header">
          <div className="title">
            <span className="pill">Emergency</span>
            <h2>Emergency Intake</h2>
            <p>Please provide details so we can share an accurate report. If you’re in immediate danger, call your local emergency number now.</p>
          </div>
          <div className="art"><img src={hero} alt="Emergency" /></div>
        </div>

        <form className="form surface elevate" method="POST" action="https://api.web3forms.com/submit">
          <input type="hidden" name="access_key" value="3125196a-8206-4610-804c-5d6c49d7ac9e" />
          <input type="hidden" name="subject" value="DocAgent Emergency Intake" />
          <input type="hidden" name="redirect" value="https://web3forms.com/success" />
          <input type="checkbox" name="botcheck" className="hidden" style={{display:'none'}} />

          <div className="grid-2">
            <input name="name" required placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
            <input name="email" type="email" required placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
          </div>
          <div className="grid-2">
            <input name="phone" required placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} />
            <input name="age" placeholder="Age" value={form.age} onChange={(e)=>setForm({...form, age:e.target.value})} />
          </div>
          <input name="location" placeholder="Location / Address" value={form.location} onChange={(e)=>setForm({...form, location:e.target.value})} />
          <textarea name="symptoms" rows="4" required placeholder="Describe the problem / symptoms" value={form.symptoms} onChange={(e)=>setForm({...form, symptoms:e.target.value})} />
          <textarea name="notes" rows="3" placeholder="Other medical info (allergies, meds)" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} />

          <div className="actions">
            <button className="btn" type="submit">Submit</button>
            <a className="btn btn-outline" href="/" onClick={(e)=>{ e.preventDefault(); window.history.back(); }}>Cancel</a>
          </div>
        </form>
      </InnerLayout>
    </Page>
  );
}

const Page = styled.div`
  .header{ display:grid; grid-template-columns: 1.2fr 1fr; gap: var(--space-6); align-items:center; margin-bottom: var(--space-6); }
  .title h2{ margin: 0 0 var(--space-2) 0; }
  .title p{ color: var(--color-text-dim); }
  .pill{ display:inline-block; padding: 4px 8px; border-radius: 999px; border: 1px solid rgba(124,92,255,0.45); background: rgba(124,92,255,0.12); color: var(--color-primary-300); font-weight: 700; font-size: 12px; margin-bottom: var(--space-2); }
  .art img{ width: 100%; max-width: 360px; margin-left: auto; }
  .form{ padding: var(--space-6); border-radius: var(--radius-lg); display:grid; gap: var(--space-3); }
  .form input, .form textarea{ width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); }
  .actions{ display:flex; gap: var(--space-3); margin-top: var(--space-2); }
  @media (max-width: 900px){ .header{ grid-template-columns: 1fr; } .art img{ margin: 0 auto; } }
`;

export default EmergencyForm;


