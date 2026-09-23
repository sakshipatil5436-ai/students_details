import { useState } from 'react';
import { DOMAINS } from '../utils';

export default function ProjectSection({ data, errors, touched, onChange, onBlur }) {
  const [charCount, setCharCount] = useState(0);

  const counterClass =
    charCount >= 500 ? 'char-counter limit' :
    charCount >= 400 ? 'char-counter warn'  : 'char-counter';

  return (
    <section className="form-section project-section">
      <div className="section-header">
        <div className="section-icon purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <div>
          <h2>Project Details</h2>
          <p>Tell us about your innovative project</p>
        </div>
      </div>

      <div className="project-fields">
        {/* Project Name */}
        <div className="field-group">
          <label htmlFor="project_name">
            Project Name <span className="required-star">*</span>
          </label>
          <div className="input-wrapper">
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            <input
              id="project_name" type="text"
              placeholder="e.g. Smart Campus Navigation System"
              value={data.name}
              className={touched.name ? (errors.name ? 'is-error' : data.name.trim() ? 'is-valid' : '') : ''}
              onChange={e => onChange('name', e.target.value)}
              onBlur={() => onBlur('name')}
            />
          </div>
          <span className={`error-msg${touched.name && errors.name ? ' show' : ''}`}>
            {touched.name && errors.name ? `⚠ ${errors.name}` : ''}
          </span>
        </div>

        {/* Domain */}
        <div className="field-group">
          <label htmlFor="project_domain">
            Project Topic / Domain <span className="required-star">*</span>
          </label>
          <div className="input-wrapper select-wrapper">
            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            <select
              id="project_domain"
              value={data.domain}
              className={touched.domain ? (errors.domain ? 'is-error' : data.domain ? 'is-valid' : '') : ''}
              onChange={e => onChange('domain', e.target.value)}
              onBlur={() => onBlur('domain')}
            >
              <option value="" disabled>Select a domain</option>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <svg className="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <span className={`error-msg${touched.domain && errors.domain ? ' show' : ''}`}>
            {touched.domain && errors.domain ? `⚠ ${errors.domain}` : ''}
          </span>
        </div>

        {/* Description */}
        <div className="field-group full-width">
          <label htmlFor="project_desc">
            Brief Description
            <span className="optional-tag">Optional</span>
          </label>
          <div className="input-wrapper textarea-wrapper">
            <textarea
              id="project_desc"
              placeholder="Describe your project idea, objectives, and the problem it solves... (max 500 characters)"
              maxLength={500}
              rows={4}
              value={data.description}
              onChange={e => {
                onChange('description', e.target.value);
                setCharCount(e.target.value.length);
              }}
            />
          </div>
          <div className={counterClass}>
            <span>{charCount}</span> / 500 characters
          </div>
        </div>
      </div>
    </section>
  );
}
