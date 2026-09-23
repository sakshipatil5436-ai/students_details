// src/components/SubmissionsPanel.jsx
import { exportToExcel, exportSingleGroup } from '../excelExport';
import { deleteSubmission, clearAllSubmissions } from '../utils';

export default function SubmissionsPanel({ data, onClear, onRefresh, onEdit }) {
  const topics      = Object.keys(data);
  const totalGroups = Object.values(data).reduce((s, arr) => s + arr.length, 0);

  const handleExportAll = () => exportToExcel(data);

  const handleClear = () => {
    if (window.confirm('Saglya submissions delete karaycha ahet? (This cannot be undone)')) {
      clearAllSubmissions();
      onClear();
    }
  };

  return (
    <div className="submissions-panel">
      {/* Header */}
      <div className="panel-header">
        <h2>
          📋 Registered Groups
          <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8, fontSize:'0.8rem' }}>
            ({totalGroups} group{totalGroups !== 1 ? 's' : ''} across {topics.length} project topic{topics.length !== 1 ? 's' : ''})
          </span>
        </h2>
        <div className="panel-actions">
          {totalGroups > 0 && (
            <>
              <button className="btn-export" onClick={handleExportAll}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export All (.xlsx)
              </button>
              <button className="btn-clear" onClick={handleClear}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {totalGroups === 0 ? (
        <div className="no-submissions">
          <svg style={{width:32,height:32,marginBottom:8,color:'#d1d5db',display:'block',margin:'0 auto 8px'}}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Abhi tak koi group registered nahi. Form submit kara!
        </div>
      ) : (
        topics.map(topic => (
          <div className="topic-group" key={topic}>

            {/* Topic heading */}
            <div className="topic-name">
              <svg style={{width:13,height:13,flexShrink:0}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              {topic}
              <span className="topic-count">
                {data[topic].length} group{data[topic].length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Group cards */}
            {data[topic].map((group, gi) => {
              // Support both old format (students[]) and new format (leader + members)
              const leader  = group.leader  || group.students?.[0] || {};
              const members = group.members || group.students?.slice(1) || [];

              return (
                <div className="group-card" key={gi}>
                  {/* Group meta row */}
                  <div className="group-card-meta">
                    <span>👥 Group: <strong>{group.groupName || group.groupId || '—'}</strong></span>
                    <span>📅 <strong>{group.academicYear}</strong></span>
                    <span>🏛️ <strong>{group.department}</strong></span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                      <span
                        style={{cursor:'pointer',color:'var(--text-mid)',fontSize:'0.73rem',fontWeight:600}}
                        onClick={() => onEdit(group)}
                      >
                        ✏️ Edit
                      </span>
                      <span
                        style={{cursor:'pointer',color:'var(--error)',fontSize:'0.73rem',fontWeight:600}}
                        onClick={() => {
                          if(window.confirm(`Are you sure you want to delete group "${group.groupName || group.groupId}"?`)) {
                            deleteSubmission(topic, group.groupName || group.groupId);
                            onRefresh();
                          }
                        }}
                      >
                        🗑️ Delete
                      </span>
                      <span
                        style={{cursor:'pointer',color:'var(--success)',fontSize:'0.73rem',fontWeight:600}}
                        onClick={() => exportSingleGroup(group)}
                      >
                        ⬇ Download
                      </span>
                    </div>
                  </div>

                  {/* Leader row */}
                  <div className="leader-row-panel">
                    <span className="leader-badge-sm">★ LEADER</span>
                    <strong style={{color:'var(--text)'}}>{leader.name || '—'}</strong>
                    <span>|</span>
                    <span>{leader.rollno}</span>
                    <span>|</span>
                    <span>{leader.email}</span>
                    <span>|</span>
                    <span>{leader.mobile}</span>
                  </div>

                  {/* Members mini-table */}
                  {members.length > 0 && (
                    <table className="mini-table">
                      <thead>
                        <tr>
                          <th>Sr.</th>
                          <th>Full Name</th>
                          <th>Roll No.</th>
                          <th>Email</th>
                          <th>Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((s, si) => (
                          <tr key={si}>
                            <td>{si + 2}</td>
                            <td>{s.name}</td>
                            <td>{s.rollno}</td>
                            <td>{s.email}</td>
                            <td>{s.mobile}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
