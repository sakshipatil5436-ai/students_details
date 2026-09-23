// src/excelExport.js
import * as XLSX from 'xlsx';

/**
 * Export all stored submissions to an Excel file.
 * Creates a single master sheet containing all project topics and students.
 */
export function exportToExcel(submissions) {
  const wb = XLSX.utils.book_new();
  const rows = [];
  
  // Header Row
  rows.push([
    'Project Topic',
    'Student Type',
    'Sr. No.',
    'Student Full Name',
    'Email Address',
    'Contact Number',
    'Submitted At'
  ]);

  Object.entries(submissions).forEach(([topic, groups]) => {
    groups.forEach((group) => {
      const submitted = new Date(group.submittedAt).toLocaleString('en-IN');
      group.students.forEach((s, i) => {
        if (!s.name || !s.name.trim()) return; // skip empty members
        rows.push([
          topic,
          i === 0 ? 'Leader' : 'Member',
          i + 1,
          s.name,
          s.email,
          s.mobile,
          submitted
        ]);
      });
      // Visual separation for each group
      rows.push(['', '', '', '', '', '', '']);
      rows.push(['─'.repeat(30), '─'.repeat(10), '─'.repeat(5), '─'.repeat(20), '─'.repeat(20), '─'.repeat(15), '─'.repeat(20)]);
      rows.push(['', '', '', '', '', '', '']);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 30 }, // Project Topic
    { wch: 15 }, // Type
    { wch: 8 },  // Sr No
    { wch: 25 }, // Name
    { wch: 30 }, // Email
    { wch: 15 }, // Mobile
    { wch: 20 }, // Submitted
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'All_Registrations');
  XLSX.writeFile(wb, 'All_Project_Registrations.xlsx');
}

/**
 * Export a single group submission to Excel.
 */
export function exportSingleGroup(data) {
  const wb = XLSX.utils.book_new();

  const rows = [
    ['GROUP PROJECT TOPIC REGISTRATION FORM'],
    [],
    ['Project Topic', data.projectTopic],
    ['Group Name', data.groupName || data.groupId],
    [],
    ['Sr. No.', 'Student Full Name', 'Email Address', 'Contact Number'],
    ...data.students.map((s, i) => [i + 1, s.name, s.email, s.mobile]),
    [],
    ['Submitted At', new Date(data.submittedAt || Date.now()).toLocaleString('en-IN')],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 8 }, { wch: 28 }, { wch: 24 }, { wch: 30 }, { wch: 18 },
  ];

  const sheetName = data.projectTopic.slice(0, 31) || 'Registration';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const safeName = data.projectTopic.replace(/[\/\\?*:[\]]/g, '_').slice(0, 50);
  XLSX.writeFile(wb, `${safeName}_Registration.xlsx`);
}
