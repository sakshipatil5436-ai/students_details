import { VALIDATORS, isEmailAlreadyUsed } from '../utils';

const IconUser = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconPhone = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);
const IconHash = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="9"  x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8"  y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);
const IconMail = () => (
  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconCircle = () => (
  <svg className="status-icon incomplete" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
  </svg>
);
const IconCheck = () => (
  <svg className="status-icon complete" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const LeaderBadge = () => (
  <span style={{
    display:'inline-flex', alignItems:'center', gap:'4px',
    fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.5px',
    padding:'2px 9px', borderRadius:'50px',
    background:'#4f46e5', color:'#fff', marginLeft:'6px',
  }}>
    ★ LEADER
  </span>
);

function ErrorMsg({ msg }) {
  return <span className={`error-msg${msg ? ' show' : ''}`}>{msg ? `⚠ ${msg}` : ''}</span>;
}

function FieldRow({ id, label, required, error, Icon, children }) {
  return (
    <div className="field-group">
      <label htmlFor={id}>
        {label} {required && <span className="required-star">*</span>}
      </label>
      <div className="input-wrapper">
        <Icon />
        {children}
      </div>
      <ErrorMsg msg={error} />
    </div>
  );
}

export default function StudentCard({ n, data, errors, onChange, onBlur, touched }) {
  const isLeader = n === 1;

  // Leader: name + mobile + email
  // Members: name + rollno + email
  const isCardValid = isLeader
    ? ['name', 'mobile', 'email'].every(f => {
        const val = data[f] || '';
        return !VALIDATORS[f === 'name' ? 'name' : f === 'mobile' ? 'mobile' : 'email'](val)
          && !(f === 'email' && isEmailAlreadyUsed(val));
      })
    : ['name', 'rollno', 'email'].every(f => {
        const val = data[f] || '';
        return !VALIDATORS[f === 'name' ? 'name' : f === 'rollno' ? 'rollno' : 'email'](val)
          && !(f === 'email' && isEmailAlreadyUsed(val));
      });

  return (
    <div className={`student-card${isCardValid ? ' is-valid' : ''}`} id={`student-card-${n}`}>
      {/* Card header */}
      <div className="student-card-header">
        <div className="student-number">{String(n).padStart(2, '0')}</div>
        <div className="student-label">
          <span className="student-title">
            Student {n}
            {isLeader && <LeaderBadge />}
          </span>
          <span className="student-subtitle">{isLeader ? 'Team Leader' : 'Team Member'}</span>
        </div>
        <div className="student-status">{isCardValid ? <IconCheck /> : <IconCircle />}</div>
      </div>

      {/* Fields */}
      <div className="student-fields">

        {/* Full Name — all */}
        <FieldRow id={`s${n}_name`} label="Full Name" required Icon={IconUser}
          error={touched.name ? errors.name : ''}>
          <input
            id={`s${n}_name`} type="text" placeholder="Enter full name"
            value={data.name} autoComplete="off"
            className={touched.name ? (errors.name ? 'is-error' : data.name.trim() ? 'is-valid' : '') : ''}
            onChange={e => onChange(n, 'name', e.target.value)}
            onBlur={() => onBlur(n, 'name')}
          />
        </FieldRow>

        {/* Leader → Mobile */}
        {isLeader && (
          <FieldRow id={`s${n}_mobile`} label="Mobile Number" required Icon={IconPhone}
            error={touched.mobile ? errors.mobile : ''}>
            <input
              id={`s${n}_mobile`} type="tel" placeholder="+91 XXXXX XXXXX"
              value={data.mobile} maxLength={13} autoComplete="off"
              className={touched.mobile ? (errors.mobile ? 'is-error' : data.mobile.trim() ? 'is-valid' : '') : ''}
              onChange={e => onChange(n, 'mobile', e.target.value.replace(/[^\d+\s]/g, ''))}
              onBlur={() => onBlur(n, 'mobile')}
            />
          </FieldRow>
        )}

        {/* Members → Roll No */}
        {!isLeader && (
          <FieldRow id={`s${n}_rollno`} label="Roll Number" required Icon={IconHash}
            error={touched.rollno ? errors.rollno : ''}>
            <input
              id={`s${n}_rollno`} type="text" placeholder="e.g. 21CS047"
              value={data.rollno} autoComplete="off"
              className={touched.rollno ? (errors.rollno ? 'is-error' : data.rollno.trim() ? 'is-valid' : '') : ''}
              onChange={e => onChange(n, 'rollno', e.target.value)}
              onBlur={() => onBlur(n, 'rollno')}
            />
          </FieldRow>
        )}

        {/* Email — all */}
        <FieldRow id={`s${n}_email`} label="Email Address" required Icon={IconMail}
          error={touched.email ? errors.email : ''}>
          <input
            id={`s${n}_email`} type="email" placeholder="student@college.edu"
            value={data.email} autoComplete="off"
            className={touched.email ? (errors.email ? 'is-error' : data.email.trim() ? 'is-valid' : '') : ''}
            onChange={e => onChange(n, 'email', e.target.value)}
            onBlur={() => onBlur(n, 'email')}
          />
        </FieldRow>

      </div>
    </div>
  );
}
