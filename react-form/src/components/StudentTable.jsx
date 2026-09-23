// src/components/StudentTable.jsx
import { VALIDATORS } from '../utils';

const COLS = [
  { key: 'name',   label: 'Student Full Name',      placeholder: 'Enter full name',    type: 'text',  validate: v => VALIDATORS.required(v, 'Full name') },
  { key: 'rollno', label: 'Roll / Enrollment No.',  placeholder: 'e.g. 21CS047',       type: 'text',  validate: v => VALIDATORS.rollno(v) },
  { key: 'email',  label: 'Email Address',           placeholder: 'student@college.edu',type: 'email', validate: v => VALIDATORS.email(v) },
  { key: 'mobile', label: 'Contact Number',          placeholder: '+91 XXXXX XXXXX',    type: 'tel',   validate: v => VALIDATORS.mobile(v) },
];

const LeaderBadge = () => (
  <span className="leader-badge">★ LEADER</span>
);

export default function StudentTable({ students, errors, touched, onChange, onBlur }) {
  return (
    <div className="student-table-wrap">
      <table className="student-table">
        <thead>
          <tr>
            <th>Sr.</th>
            {COLS.map(c => (
              <th key={c.key}>
                {c.label} <span className="req">*</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const isLeader = i === 0;
            return (
              <tr key={i} className={isLeader ? 'leader-row' : ''}>

                {/* Sr No cell */}
                <td className="sr-cell">
                  <div className="sr-num">
                    <span>{i + 1}</span>
                    {isLeader && <LeaderBadge />}
                  </div>
                </td>

                {/* Data fields */}
                {COLS.map(col => {
                  const err    = touched[i]?.[col.key] ? errors[i]?.[col.key] : '';
                  const val    = s[col.key] || '';
                  const hasErr = !!err;
                  const isOk   = !hasErr && !!val.trim() && touched[i]?.[col.key];
                  return (
                    <td key={col.key} className="td-field">
                      <input
                        id={`s${i + 1}_${col.key}`}
                        type={col.type}
                        className={`td-input${hasErr ? ' err' : isOk ? ' ok' : ''}`}
                        placeholder={isLeader && col.key === 'name'
                          ? 'Leader full name'
                          : col.placeholder}
                        value={val}
                        autoComplete="off"
                        maxLength={col.key === 'mobile' ? 13 : undefined}
                        onChange={e => {
                          let v = e.target.value;
                          if (col.key === 'mobile') v = v.replace(/[^\d+\s]/g, '');
                          onChange(i, col.key, v);
                        }}
                        onBlur={() => onBlur(i, col.key)}
                      />
                      <div className={`td-err${hasErr ? ' show' : ''}`}>
                        {hasErr ? `⚠ ${err}` : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="table-legend">
        ★ Sr. No. 1 = Group Leader &nbsp;|&nbsp; Only the leader registers on behalf of the group. Other members do not submit separately.
      </div>
    </div>
  );
}
