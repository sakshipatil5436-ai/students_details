// src/excelExport.js
import * as XLSX from 'xlsx';

/**
 * Export all stored submissions to an Excel file.
 * Each project topic becomes a separate Sheet tab.
 */
export function exportToExcel(submissions) {
  const wb = XLSX.utils.book_new();

  Object.entries(submissions).forEach(([topic, groups]) => {
    const rows = [];

    groups.forEach((group, gi) => {
      // Group header row
      rows.push([`Group ${gi + 1}`, '', '', '', '']);
      rows.push([
        'Group Name', group.groupName || group.groupId,
        'Submitted', new Date(group.submittedAt).toLocaleString('en-IN'),
      ]);
      rows.push([]); // blank
      // Student table header
      rows.push([
        'Sr. No.',
        'Student Full Name',
        'Email Address',
        'Contact Number',
      ]);
      // Student rows
      group.students.forEach((s, i) => {
        rows.push([
          i + 1,
          s.name,
          s.email,
          s.mobile,
        ]);
      });
      rows.push([]); // spacer between groups
      rows.push(['─'.repeat(60)]);
      rows.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Column widths
    ws['!cols'] = [
      { wch: 8 }, { wch: 28 }, { wch: 22 }, { wch: 30 }, { wch: 18 },
      { wch: 16 }, { wch: 16 }, { wch: 22 },
    ];

    // Sheet name max 31 chars
    const sheetName = topic.length > 31 ? topic.slice(0, 28) + '...' : topic;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, 'Group_Project_Registrations.xlsx');
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
