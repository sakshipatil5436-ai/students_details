// src/App.jsx
import { useState, useEffect, useCallback } from 'react';
import StudentTable from './components/StudentTable';
import SubmissionsPanel from './components/SubmissionsPanel';
import { VALIDATORS, saveSubmission, updateSubmission, getAllSubmissions, isTopicAlreadyRegistered } from './utils';
import { exportSingleGroup } from './excelExport';

// ── Constants ─────────────────────────────────────────────────
const N            = 4;
const ADMIN_PASS   = 'admin@@123'; // Change this password

const blankStudent = () => ({ name: '', email: '', mobile: '' });
const blankErrors  = () => ({ name: '', email: '', mobile: '' });
const blankTouched = () => ({ name: false, email: false, mobile: false });

const blankGroup = () => ({
  projectTopic: '',
});
const blankGroupErr = () => ({
  projectTopic: '',
});

const STUDENT_VALIDATORS = {
  name:   v => VALIDATORS.required(v, 'Full name'),
  email:  v => VALIDATORS.email(v),
  mobile: v => VALIDATORS.mobile(v),
};

// ── Field wrapper — MUST be outside App to prevent remount on re-render ──────
function Field({ id, label, required, error, touched: isTouched, children }) {
  return (
    <div className="field-wrap">
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="req">*</span>}
      </label>
      {children}
      <div className={`field-error${isTouched && error ? ' show' : ''}`}>
        {isTouched && error ? `⚠ ${error}` : ''}
      </div>
    </div>
  );
}

// ── Admin Login Panel ─────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pass, setPass]   = useState('');
  const [err,  setErr]    = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (pass === ADMIN_PASS) { onLogin(); }
    else { setErr('Wrong password. Please try again.'); setPass(''); }
  };

  return (
    <div style={{
      maxWidth: 340, margin: '40px auto', padding: '28px 24px',
      background: '#fff', border: '1px solid #ccc', borderRadius: 6,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔒</div>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>Admin Access</h2>
      <p style={{ fontSize: '0.78rem', color: '#666', marginBottom: 16 }}>
        Enter password to view all group submissions.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={pass}
          onChange={e => { setPass(e.target.value); setErr(''); }}
          placeholder="Enter admin password"
          style={{
            width: '100%', padding: '8px 10px', marginBottom: 8,
            border: `1px solid ${err ? '#cc0000' : '#ccc'}`,
            borderRadius: 4, fontSize: '0.875rem', outline: 'none',
          }}
          autoFocus
        />
        {err && <div style={{ fontSize: '0.74rem', color: '#cc0000', marginBottom: 8 }}>⚠ {err}</div>}
        <button type="submit" style={{
          width: '100%', padding: '9px', background: '#111', color: '#fff',
          border: 'none', borderRadius: 4, fontWeight: 700, cursor: 'pointer',
          fontSize: '0.875rem',
        }}>
          Login
        </button>
      </form>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const [group,      setGroup]      = useState(blankGroup());
  const [groupErr,   setGroupErr]   = useState(blankGroupErr());
  const [groupTouch, setGroupTouch] = useState({});

  const [students,  setStudents]  = useState(Array.from({ length: N }, blankStudent));
  const [stuErrors, setStuErrors] = useState(Array.from({ length: N }, blankErrors));
  const [stuTouch,  setStuTouch]  = useState(Array.from({ length: N }, blankTouched));

  const [submitting,    setSubmitting]    = useState(false);
  const [shake,         setShake]         = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [lastData,      setLastData]      = useState(null);
  const [progress,      setProgress]      = useState(0);
  const [groupDupErr,   setGroupDupErr]   = useState('');

  // Admin panel state
  const [showAdminBtn,  setShowAdminBtn]  = useState(false);
  const [showAdminLogin,setShowAdminLogin]= useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [submissions,   setSubmissions]   = useState(getAllSubmissions());

  // Editing state
  const [editingMode,   setEditingMode]   = useState(null);

  // ── Progress ────────────────────────────────────────────────
  useEffect(() => {
    let filled = 0;
    ['projectTopic'].forEach(f => {
      if (group[f]?.trim()) filled++;
    });
    students.forEach(s => {
      if (!VALIDATORS.required(s.name, 'x')) filled++;
      if (!VALIDATORS.email(s.email))         filled++;
      if (!VALIDATORS.mobile(s.mobile))       filled++;
    });
    setProgress(Math.round((filled / (1 + N * 3)) * 100));
  }, [group, students]);

  // ── Modal escape key ─────────────────────────────────────────
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') { setShowModal(false); setShowAdminLogin(false); }};
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  // ── Group handlers ───────────────────────────────────────────
  const handleGroupChange = useCallback((field, val) => {
    setGroup(prev => ({ ...prev, [field]: val }));
    if (val.trim()) setGroupErr(prev => ({ ...prev, [field]: '' }));
    if (field === 'projectTopic') setGroupDupErr('');
  }, []);

  const handleGroupBlur = useCallback((field) => {
    setGroupTouch(prev => ({ ...prev, [field]: true }));
    const labels = { projectTopic:'Project topic' };
    setGroupErr(prev => ({
      ...prev,
      [field]: VALIDATORS.required(group[field], labels[field]) || '',
    }));
  }, [group]);

  // ── Student handlers ─────────────────────────────────────────
  const handleStuChange = useCallback((i, key, val) => {
    setStudents(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: val };
      return next;
    });
    if (!STUDENT_VALIDATORS[key](val)) {
      setStuErrors(prev => {
        const next = [...prev];
        next[i] = { ...next[i], [key]: '' };
        return next;
      });
    }
  }, []);

  const handleStuBlur = useCallback((i, key) => {
    setStuTouch(prev => {
      const next = [...prev]; next[i] = { ...next[i], [key]: true }; return next;
    });
    setStuErrors(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: STUDENT_VALIDATORS[key](students[i][key]) || '' };
      return next;
    });
  }, [students]);

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = e => {
    e.preventDefault();
    let allOk = true;

    // Group validation
    const newGroupErr   = blankGroupErr();
    const newGroupTouch = { projectTopic: true };
    const labels = { projectTopic:'Project topic' };
    Object.keys(labels).forEach(f => {
      newGroupErr[f] = VALIDATORS.required(group[f], labels[f]) || '';
      if (newGroupErr[f]) allOk = false;
    });

    // Duplicate project topic check
    let dupErr = '';
    if (!newGroupErr.projectTopic && group.projectTopic.trim()) {
      if (isTopicAlreadyRegistered(group.projectTopic)) {
        if (!editingMode || (editingMode.projectTopic.toLowerCase() !== group.projectTopic.toLowerCase())) {
          dupErr = `Project "${group.projectTopic.trim()}" is already registered. Each topic can be registered only once.`;
          allOk  = false;
        }
      }
    }
    setGroupDupErr(dupErr);

    // Student validation
    const newStuErrors = students.map(s => ({
      name:   STUDENT_VALIDATORS.name(s.name)    || '',
      email:  STUDENT_VALIDATORS.email(s.email)  || '',
      mobile: STUDENT_VALIDATORS.mobile(s.mobile) || '',
    }));
    const newStuTouch = Array.from({ length: N }, () =>
      ({ name: true, email: true, mobile: true })
    );
    newStuErrors.forEach(e => {
      if (e.name || e.email || e.mobile) allOk = false;
    });

    setGroupErr(newGroupErr);
    setGroupTouch(newGroupTouch);
    setStuErrors(newStuErrors);
    setStuTouch(newStuTouch);

    if (!allOk) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => document.querySelector('.err')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
      return;
    }

    setSubmitting(true);
    const submission = { ...group, students: students.map(s => ({ ...s })), submittedAt: new Date().toISOString() };
    setTimeout(() => {
      if (editingMode) {
        updateSubmission(editingMode.projectTopic, submission);
      } else {
        saveSubmission(submission);
      }
      setLastData(submission);
      setSubmissions(getAllSubmissions());
      setSubmitting(false);
      setShowModal(true);
    }, 1200);
  };

  // ── Reset ────────────────────────────────────────────────────
  const resetForm = () => {
    setGroup(blankGroup());
    setGroupErr(blankGroupErr());
    setGroupTouch({});
    setGroupDupErr('');
    setStudents(Array.from({ length: N }, blankStudent));
    setStuErrors(Array.from({ length: N }, blankErrors));
    setStuTouch(Array.from({ length: N }, blankTouched));
    setEditingMode(null);
    setShowModal(false);
  };

  // ── Admin panel handlers ──────────────────────────────────────
  const handleAdminLogin = () => {
    setAdminLoggedIn(true);
    setShowAdminLogin(false);
    setSubmissions(getAllSubmissions());
  };

  const handleEdit = (grp) => {
    setGroup({
      projectTopic: grp.projectTopic,
    });
    const parsedStudents = grp.students || [grp.leader, ...grp.members];
    const newStudents = Array.from({ length: N }, (_, i) => parsedStudents[i] || blankStudent());
    setStudents(newStudents);
    setEditingMode({ projectTopic: grp.projectTopic });
    
    // Clear errors
    setGroupErr(blankGroupErr()); setGroupTouch({});
    setStuErrors(Array.from({ length: N }, blankErrors)); setStuTouch(Array.from({ length: N }, blankTouched));
    setGroupDupErr('');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="app-wrapper">

      {/* ══ FORM VIEW (Hidden for Admin unless editing) ════════ */}
      {(!adminLoggedIn || editingMode) && (
      <div className="form-paper">
        <div className="form-title-banner" style={editingMode ? { background: '#92400e' } : {}}>
          <h1>{editingMode ? 'Admin: Editing Group Data' : 'Group Project Topic Registration Form'}</h1>
          <p>
            {editingMode ? `Updating data for project: ${editingMode.projectTopic}` : 'Register your Project Topic below (Sr. 1 student is the Group Leader)'}
          </p>
        </div>

        <form className="form-body" onSubmit={handleSubmit} noValidate>

          {/* Part A */}
          <div className="part-header">
            <span className="part-badge">PART A</span>
            <span className="part-title">Group &amp; Academic Details</span>
            <div className="part-divider" />
          </div>

          <div className="group-details-grid" style={{ gridTemplateColumns: '1fr' }}>

            <Field id="projectTopic" label="Project Topic / Name" required
              error={groupDupErr || groupErr.projectTopic} touched={groupTouch.projectTopic || !!groupDupErr}>
              <input
                id="projectTopic" type="text"
                className={`field-input${groupDupErr ? ' err' : groupTouch.projectTopic ? (groupErr.projectTopic ? ' err' : group.projectTopic?.trim() ? ' ok' : '') : ''}`}
                placeholder="e.g. Smart Attendance System using Face Recognition"
                value={group.projectTopic}
                onChange={e => handleGroupChange('projectTopic', e.target.value)}
                onBlur={() => handleGroupBlur('projectTopic')}
              />
              {groupDupErr && (
                <div className="dup-error-block">
                  🚫 {groupDupErr}
                  <span>Ek project topic var fakt ek group register karu shakel.</span>
                </div>
              )}
            </Field>

          </div>

          {/* Part B */}
          <div className="part-header">
            <span className="part-badge">PART B</span>
            <span className="part-title">Student Details (All 4 Members)</span>
            <div className="part-divider" />
          </div>

          <StudentTable
            students={students}
            errors={stuErrors}
            touched={stuTouch}
            onChange={handleStuChange}
            onBlur={handleStuBlur}
          />

          {/* Progress */}
          <div className="progress-wrap">
            <div className="progress-meta">
              <span>Form Completion</span>
              <span className="progress-pct">{progress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="submit" className={`btn-submit${shake ? ' shake' : ''}`} disabled={submitting}>
              {submitting ? (
                <>
                  <svg className="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                  {editingMode ? 'Save Changes' : 'Submit Registration'}
                </>
              )}
            </button>

            <button type="button" className="btn-secondary" onClick={resetForm}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.46"/>
              </svg>
              {editingMode ? 'Cancel Edit' : 'Reset Form'}
            </button>

            <div className="form-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Each group can register only once.
            </div>
          </div>

        </form>
      </div>
      )}

      {/* ══ ADMIN PANEL TRIGGER — visible link at bottom ══ */}
      <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 40 }}>
        <button
          onClick={() => adminLoggedIn ? null : setShowAdminLogin(true)}
          style={{
            background: '#1a1a1a', border: '1px solid #000', borderRadius: 6,
            padding: '8px 20px', fontSize: '0.85rem', color: '#fff',
            cursor: 'pointer', fontWeight: '500', letterSpacing: '0.5px'
          }}>
          {adminLoggedIn ? '📋 Admin Panel (scroll down)' : '🔒 Admin Login'}
        </button>
      </div>

      {/* ══ ADMIN LOGIN MODAL ══════════════════════════════════ */}
      {showAdminLogin && !adminLoggedIn && (
        <div
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            zIndex:200, padding:20,
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowAdminLogin(false); }}
        >
          <AdminLogin onLogin={handleAdminLogin} />
        </div>
      )}

      {/* ══ ADMIN SUBMISSIONS PANEL — only after login ══════════ */}
      {adminLoggedIn && (
        <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:20, marginBottom:8 }}>
            <span style={{ fontSize:'0.78rem', color:'#666' }}>🔓 Admin view — only you can see this</span>
            <button
              onClick={() => { setAdminLoggedIn(false); }}
              style={{
                background:'none', border:'1px solid #ccc', borderRadius:4,
                padding:'3px 12px', fontSize:'0.72rem', color:'#888', cursor:'pointer',
              }}>
              Logout
            </button>
          </div>
          <SubmissionsPanel
            data={submissions}
            onClear={() => setSubmissions(getAllSubmissions())}
            onRefresh={() => setSubmissions(getAllSubmissions())}
            onEdit={handleEdit}
          />
        </>
      )}

      {/* ══ SUCCESS MODAL ════════════════════════════════════════ */}
      <div
        className={`modal-overlay${showModal ? ' show' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
      >
        <div className="modal-box">
          <div className="modal-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2>Registration Successful! ✅</h2>
          <p>
            Your group registration has been recorded successfully.
            Your teacher will have access to all submitted data.
          </p>

          {lastData && (
            <div className="modal-info-box">
              <div>📁 <strong>Project:</strong> {lastData.projectTopic}</div>
              <div>👥 <strong>Group:</strong> {lastData.groupName}</div>
              <div>🧑‍🎓 <strong>Students registered:</strong> {lastData.students.length}</div>
            </div>
          )}

          <div className="modal-btns">
            <button className="modal-btn-secondary" onClick={resetForm}>
              Register Another Group
            </button>
            <button className="modal-btn-secondary" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
