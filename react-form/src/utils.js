// src/utils.js
export const VALIDATORS = {
  required(val, label = 'This field') {
    if (!val || !String(val).trim()) return `${label} is required.`;
    return null;
  },
  rollno(val) {
    if (!val?.trim()) return 'Roll / Enrollment No. is required.';
    return null;
  },
  email(val) {
    if (!val?.trim()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim()))
      return 'Please enter a valid email address.';
    return null;
  },
  mobile(val) {
    const cleaned = (val || '').replace(/\D/g, ''); // Extract only digits
    if (!cleaned) return 'Contact number is required.';
    if (cleaned.length !== 10)
      return 'Enter exactly 10 digits.';
    return null;
  },
};

// ── localStorage ─────────────────────────────────────────────
const STORAGE_KEY = 'gptr_submissions';

export function getAllSubmissions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

/**
 * Check if a project topic already exists in storage.
 * A topic can register only ONCE.
 */
export function isTopicAlreadyRegistered(topic) {
  const all = getAllSubmissions();
  const name = String(topic).trim().toLowerCase();
  return Object.keys(all).some(k => String(k).trim().toLowerCase() === name && all[k].length > 0);
}

/**
 * Save a group's submission.
 * Storage structure:
 *  {
 *    "ProjectTopicName": [
 *       { groupId, academicYear, department, projectTopic,
 *         leader: { name, rollno, email, mobile },
 *         members: [ { name, rollno, email, mobile }, ... ],  // 3 members
 *         students: [ all 4 in order ],
 *         submittedAt }
 *    ]
 *  }
 */
export function saveSubmission(data) {
  const all = getAllSubmissions();
  const key = data.projectTopic.trim();
  if (!all[key]) all[key] = [];

  // Student[0] = leader, [1-3] = members
  const [leader, ...members] = data.students;
  const entry = {
    ...data,
    leader,
    members,
    submittedAt: new Date().toISOString(),
  };

  all[key].push(entry);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { }
}

export function clearAllSubmissions() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { }
}

export function deleteSubmission(projectTopic) {
  const all = getAllSubmissions();
  const key = String(projectTopic).trim();
  
  if (all[key]) {
    delete all[key];
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { }
  }
}

export function updateSubmission(oldProjectTopic, data) {
  // First delete the old submission
  deleteSubmission(oldProjectTopic);
  // Then save the updated submission
  saveSubmission(data);
}
