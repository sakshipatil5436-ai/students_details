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
    const cleaned = (val || '').replace(/\s+/g, '').replace(/-/g, '');
    if (!cleaned) return 'Contact number is required.';
    if (!/^(\+91)?[6-9]\d{9}$/.test(cleaned))
      return 'Enter a valid 10-digit contact number.';
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
 * Check if a groupName already exists in storage (across ALL project topics).
 * A group can register only ONCE — identified by groupName.
 */
export function isGroupAlreadyRegistered(groupName) {
  const all = getAllSubmissions();
  const name = String(groupName).trim().toLowerCase();
  return Object.values(all).some(arr =>
    arr.some(g => String(g.groupName || g.groupId || '').trim().toLowerCase() === name)
  );
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
