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

// ── API Functions ─────────────────────────────────────────────

export async function getAllSubmissions() {
  try {
    const res = await fetch('/api/submissions');
    if (!res.ok) return {};
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    return {};
  }
}

/**
 * Check if a project topic already exists.
 */
export async function isTopicAlreadyRegistered(topic) {
  const all = await getAllSubmissions();
  const name = String(topic).trim().toLowerCase();
  return Object.keys(all).some(k => String(k).trim().toLowerCase() === name && all[k].length > 0);
}

export async function saveSubmission(data) {
  const [leader, ...members] = data.students;
  const entry = {
    ...data,
    leader,
    members,
    submittedAt: new Date().toISOString(),
  };

  try {
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch (err) {
    console.error('API Error:', err);
  }
}

export async function clearAllSubmissions() {
  try {
    await fetch(`/api/submissions`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.error('API Error:', err);
  }
}

export async function deleteSubmission(projectTopic) {
  const key = String(projectTopic).trim();
  try {
    await fetch(`/api/submissions/${encodeURIComponent(key)}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.error('API Error:', err);
  }
}

export async function updateSubmission(oldProjectTopic, data) {
  const [leader, ...members] = data.students;
  const entry = {
    ...data,
    leader,
    members,
    submittedAt: new Date().toISOString(),
  };

  try {
    await fetch(`/api/submissions/${encodeURIComponent(oldProjectTopic)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch (err) {
    console.error('API Error:', err);
  }
}
