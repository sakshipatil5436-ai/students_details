export default function SuccessModal({ show, projectName, onClose }) {
  return (
    <div
      className={`modal-overlay${show ? ' show' : ''}`}
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card">
        <div className="modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 id="modal-title">Registration Successful!</h2>
        <p>Your team has been registered successfully. You will receive a confirmation on your registered email addresses.</p>
        {projectName && (
          <div className="modal-team">📁 Project: {projectName}</div>
        )}
        <button className="modal-btn" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
