/**
 * Utility to export tables and student report cards directly as Microsoft Word (.docx / .doc) files.
 */

export const exportToWordDoc = (filename: string, title: string, subtitle: string, htmlContent: string) => {
  const docHtml = `
<html xmlns:o='urn:schemas-microsoft-office:office' xmlns:w='urn:schemas-microsoft-office:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.4;
      padding: 0;
      margin: 0;
    }
    .header-table {
      width: 100%;
      border-bottom: 2px solid #5B2C16;
      margin-bottom: 15px;
      padding-bottom: 10px;
    }
    .header-title {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 18pt;
      font-weight: bold;
      color: #5B2C16;
      text-align: center;
    }
    .header-subtitle {
      font-size: 11pt;
      color: #666;
      text-align: center;
      margin-top: 4px;
    }
    .doc-title {
      font-family: 'Georgia', serif;
      font-size: 14pt;
      font-weight: bold;
      color: #333;
      text-align: center;
      margin: 15px 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      background-color: #fcf9f5;
      border: 1px solid #e0d0c0;
    }
    .meta-table td {
      padding: 8px 12px;
      font-size: 10pt;
      border: 1px solid #e0d0c0;
    }
    .meta-label {
      font-weight: bold;
      color: #5B2C16;
      width: 20%;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    .data-table th {
      background-color: #5B2C16;
      color: #ffffff;
      padding: 8px 10px;
      border: 1px solid #3d1c0c;
      font-size: 10pt;
      font-weight: bold;
      text-align: left;
    }
    .data-table td {
      padding: 7px 10px;
      border: 1px solid #dcdcdc;
      font-size: 9.5pt;
    }
    .data-table tr:nth-child(even) {
      background-color: #fbf9f6;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .grade-badge {
      display: inline-block;
      padding: 2px 6px;
      font-weight: bold;
      border-radius: 3px;
      background-color: #f3ebdf;
      color: #5B2C16;
    }
    .signatures {
      margin-top: 40px;
      width: 100%;
    }
    .signatures td {
      width: 50%;
      vertical-align: top;
      font-size: 10pt;
      border: none;
    }
    .sig-line {
      border-top: 1px dashed #666;
      margin-top: 45px;
      padding-top: 5px;
      font-weight: bold;
      color: #333;
    }
    .footer-note {
      margin-top: 30px;
      font-size: 8pt;
      color: #888;
      text-align: center;
      border-top: 1px solid #eee;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header-table">
    <div class="header-title">ሐይመተ አብርሃም ሰንበት ትምህርት ቤት</div>
    <div class="header-subtitle">Haymete Abraham Sunday School Academic Management Portal</div>
    <div class="doc-title">${title}</div>
    ${subtitle ? `<div style="text-align:center; font-size:10pt; color:#666;">${subtitle}</div>` : ''}
  </div>

  ${htmlContent}

  <div class="footer-note">
    Generated automatically on ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })} — Official School Record
  </div>
</body>
</html>
  `;

  const blob = new Blob(['\ufeff', docHtml], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.doc') || filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportTableToWord = (
  filename: string,
  title: string,
  headers: string[],
  rows: (string | number)[][]
) => {
  const tableHtml = `
    <table class="data-table">
      <thead>
        <tr>
          ${headers.map((h) => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            ${row.map((cell) => `<td>${cell}</td>`).join('')}
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
  `;

  exportToWordDoc(filename, title, '', tableHtml);
};
