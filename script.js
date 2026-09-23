/* ============================================================
   script.js — Student Project Registration Form
   ============================================================ */

'use strict';

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const STUDENTS = [1, 2, 3, 4];

const FIELDS = {
  students: STUDENTS.flatMap(n => [
    { id: `s${n}_name`,   type: 'name',   label: `Student ${n} Full Name` },
    { id: `s${n}_mobile`, type: 'mobile', label: `Student ${n} Mobile` },
    { id: `s${n}_email`,  type: 'email',  label: `Student ${n} Email` },
  ]),
  project: [
    { id: 'project_name',   type: 'text',   label: 'Project Name' },
    { id: 'project_domain', type: 'select', label: 'Project Domain' },
  ],
};

const ALL_REQUIRED = [...FIELDS.students, ...FIELDS.project];

// ─── VALIDATION RULES ──────────────────────────────────────────────────────────
const VALIDATORS = {
  name(val) {
    if (!val.trim()) return 'Full name is required.';
    if (val.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!/^[a-zA-Z\s'.'-]+$/.test(val.trim())) return 'Please enter a valid name.';
    return null;
  },
  mobile(val) {
    const cleaned = val.replace(/\s+/g, '').replace(/-/g, '');
    if (!cleaned) return 'Mobile number is required.';
    // Accept: 10 digits, or +91 followed by 10 digits
    if (!/^(\+91)?[6-9]\d{9}$/.test(cleaned)) {
      return 'Enter a valid 10-digit Indian mobile number.';
    }
    return null;
  },
  email(val) {
    if (!val.trim()) return 'Email address is required.';
    // RFC-5322 simplified
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim())) {
      return 'Please enter a valid email address.';
    }
    return null;  // duplicate & used-email checks run separately at submit
  },
  text(val) {
    if (!val.trim()) return 'This field is required.';
    if (val.trim().length < 2) return 'Must be at least 2 characters.';
    return null;
  },
  select(val) {
    if (!val) return 'Please select a domain.';
    return null;
  },
};

// ─── USED EMAILS STORE (localStorage) ─────────────────────────────────────────
const STORAGE_KEY = 'sprf_used_emails';

function getUsedEmails() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch { return new Set(); }
}

function saveUsedEmails(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* storage unavailable */ }
}

function isEmailAlreadyUsed(email) {
  return getUsedEmails().has(email.trim().toLowerCase());
}

function markEmailsAsUsed(emails) {
  const set = getUsedEmails();
  emails.forEach(e => set.add(e.trim().toLowerCase()));
  saveUsedEmails(set);
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function getInput(id)    { return document.getElementById(id); }
function getError(id)    { return document.getElementById(`err-${id}`); }
function getCard(n)      { return document.getElementById(`student-card-${n}`); }
function getStatus(n)    { return document.getElementById(`status-${n}`); }

function showError(id, msg) {
  const el = getError(id);
  if (!el) return;
  el.textContent = msg ? `⚠ ${msg}` : '';
  el.classList.toggle('show', !!msg);
  const inp = getInput(id);
  if (inp) {
    inp.classList.toggle('is-error', !!msg);
    inp.classList.toggle('is-valid', !msg && inp.value.trim() !== '');
  }
}

function clearError(id) {
  showError(id, '');
}

function validateField(fieldDef, showImmediate = true) {
  const inp  = getInput(fieldDef.id);
  if (!inp) return true;
  const val  = inp.value;
  const err  = (VALIDATORS[fieldDef.type] || VALIDATORS.text)(val);
  if (showImmediate) showError(fieldDef.id, err);
  return !err;
}

// ─── STUDENT CARD STATUS ────────────────────────────────────────────────────────
function updateStudentStatus(n) {
  const fields = FIELDS.students.filter(f => f.id.startsWith(`s${n}_`));
  const allValid = fields.every(f => {
    const inp = getInput(f.id);
    return inp && !(VALIDATORS[f.type] || VALIDATORS.text)(inp.value);
  });

  const card   = getCard(n);
  const status = getStatus(n);
  if (!card || !status) return;

  card.classList.toggle('is-valid', allValid);

  if (allValid) {
    status.innerHTML = `
      <svg class="status-icon complete" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>`;
  } else {
    status.innerHTML = `
      <svg class="status-icon incomplete" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
      </svg>`;
  }
}

// ─── PROGRESS BAR ──────────────────────────────────────────────────────────────
function updateProgress() {
  const total   = ALL_REQUIRED.length;
  const filled  = ALL_REQUIRED.filter(f => {
    const inp = getInput(f.id);
    return inp && !(VALIDATORS[f.type] || VALIDATORS.text)(inp.value);
  }).length;

  const pct = Math.round((filled / total) * 100);
  const bar = document.getElementById('progress-fill');
  const lbl = document.getElementById('progress-pct');
  if (bar) bar.style.width = `${pct}%`;
  if (lbl) lbl.textContent = `${pct}%`;
}

// ─── CHARACTER COUNTER ─────────────────────────────────────────────────────────
function initCharCounter() {
  const textarea  = getInput('project_desc');
  const counter   = document.getElementById('char-count');
  const wrapper   = counter?.closest('.char-counter');
  if (!textarea || !counter) return;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    counter.textContent = len;
    wrapper?.classList.toggle('warn',  len >= 400 && len < 500);
    wrapper?.classList.toggle('limit', len >= 500);
  });
}

// ─── LIVE VALIDATION (blur + input events) ────────────────────────────────────
function attachLiveValidation() {
  ALL_REQUIRED.forEach(field => {
    const inp = getInput(field.id);
    if (!inp) return;

    // On blur: validate immediately
    inp.addEventListener('blur', () => {
      validateField(field, true);

      // Extra: live used-email check on blur for email fields
      if (field.type === 'email') {
        const val = inp.value.trim().toLowerCase();
        if (val && isEmailAlreadyUsed(val)) {
          showError(field.id, 'This email has already been used to register. Each email can only submit once.');
        }
      }

      const n = STUDENTS.find(n => field.id.startsWith(`s${n}_`));
      if (n) updateStudentStatus(n);
      updateProgress();
    });

    // On input: clear error once valid, update progress
    inp.addEventListener('input', () => {
      const val = inp.value;
      const err = (VALIDATORS[field.type] || VALIDATORS.text)(val);
      if (!err) clearError(field.id);
      const n = STUDENTS.find(n => field.id.startsWith(`s${n}_`));
      if (n) updateStudentStatus(n);
      updateProgress();
    });
  });
}

// ─── MOBILE FORMATTING ─────────────────────────────────────────────────────────
function attachMobileFormatting() {
  STUDENTS.forEach(n => {
    const inp = getInput(`s${n}_mobile`);
    if (!inp) return;
    inp.addEventListener('input', () => {
      // Allow only digits, +, spaces
      inp.value = inp.value.replace(/[^\d+\s]/g, '');
    });
  });
}

// ─── FORM SUBMIT ───────────────────────────────────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();

  // Validate ALL required fields
  let firstInvalid = null;
  let allOk = true;

  ALL_REQUIRED.forEach(field => {
    const ok = validateField(field, true);
    if (!ok) {
      allOk = false;
      if (!firstInvalid) firstInvalid = getInput(field.id);
    }
  });

  // ── CHECK 1: Duplicate emails within the form ──────────────────────────────
  const emailValues = STUDENTS.map(n => ({
    n,
    id:  `s${n}_email`,
    val: getInput(`s${n}_email`)?.value?.trim().toLowerCase() || '',
  }));

  // Only check emails that are individually valid (non-empty)
  emailValues.forEach(({ n, id, val }) => {
    if (!val) return; // already caught by required validator
    const others = emailValues.filter(e => e.n !== n && e.val === val);
    if (others.length > 0) {
      showError(id, 'This email is already used by another team member.');
      allOk = false;
      if (!firstInvalid) firstInvalid = getInput(id);
    }
  });

  // ── CHECK 2: Email already submitted before (localStorage) ────────────────
  emailValues.forEach(({ id, val }) => {
    if (!val) return;
    if (isEmailAlreadyUsed(val)) {
      showError(id, 'This email has already been used to register. Each email can only submit once.');
      allOk = false;
      if (!firstInvalid) firstInvalid = getInput(id);
    }
  });

  // Update student statuses
  STUDENTS.forEach(n => updateStudentStatus(n));
  updateProgress();

  if (!allOk) {
    // Scroll to first error
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus();
    }
    // Shake the submit button
    const btn = document.getElementById('submitBtn');
    btn?.classList.add('shake');
    setTimeout(() => btn?.classList.remove('shake'), 600);
    return;
  }

  // ── Simulate async submit ──────────────────────────────────────────────────
  const btn     = document.getElementById('submitBtn');
  const btnText = btn?.querySelector('.btn-text');
  const btnLoad = btn?.querySelector('.btn-loader');

  if (btn) {
    btn.disabled   = true;
    btnText.style.display = 'none';
    btnLoad.style.display = 'flex';
  }

  // Collect all 4 emails to mark as used after successful submit
  const submittedEmails = STUDENTS.map(n =>
    getInput(`s${n}_email`)?.value?.trim().toLowerCase() || ''
  ).filter(Boolean);

  setTimeout(() => {
    if (btn) {
      btn.disabled = false;
      btnText.style.display = 'flex';
      btnLoad.style.display = 'none';
    }
    // ── Mark emails as used in localStorage ──
    markEmailsAsUsed(submittedEmails);
    showSuccessModal();
  }, 1800);
}

// ─── SUCCESS MODAL ─────────────────────────────────────────────────────────────
function showSuccessModal() {
  const projectName = getInput('project_name')?.value?.trim() || 'Your Project';
  const teamEl = document.getElementById('modal-team-name');
  if (teamEl) teamEl.textContent = `📁 Project: ${projectName}`;

  const modal = document.getElementById('successModal');
  modal?.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('successModal');
  modal?.classList.remove('show');
  document.body.style.overflow = '';
  // Reset form
  document.getElementById('registrationForm')?.reset();
  STUDENTS.forEach(n => {
    updateStudentStatus(n);
    ['name', 'mobile', 'email'].forEach(f => {
      clearError(`s${n}_${f}`);
      const inp = getInput(`s${n}_${f}`);
      if (inp) { inp.classList.remove('is-valid', 'is-error'); }
    });
  });
  ['project_name', 'project_domain'].forEach(id => {
    clearError(id);
    const inp = getInput(id);
    if (inp) { inp.classList.remove('is-valid', 'is-error'); }
  });
  document.getElementById('char-count').textContent = '0';
  updateProgress();
}

// Close modal on overlay click
document.getElementById('successModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Escape key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ─── SHAKE ANIMATION (inline so we don't need extra CSS) ──────────────────────
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  .shake {
    animation: btnShake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }
  @keyframes btnShake {
    10%, 90% { transform: translateX(-3px); }
    20%, 80% { transform: translateX(4px); }
    30%, 50%, 70% { transform: translateX(-5px); }
    40%, 60% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);

// ─── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  attachLiveValidation();
  attachMobileFormatting();
  initCharCounter();
  updateProgress();

  const form = document.getElementById('registrationForm');
  form?.addEventListener('submit', handleSubmit);
});
