import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
} from 'docx';
import { formatEthiopianDate } from './ethiopianCalendar';

// Helper to trigger browser download of a generated Docx Blob
async function saveDocxBlob(doc: Document, filename: string) {
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Common Table Borders
const standardBorder = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: 'D0C0B0',
};

const cellBorders = {
  top: standardBorder,
  bottom: standardBorder,
  left: standardBorder,
  right: standardBorder,
};

const noBorder = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
};

const transparentBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
};

// Common Header creation
function createChurchHeader(title: string, subtitle?: string): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: 'ሐይመተ አብርሃም ሰንበት ትምህርት ቤት',
          bold: true,
          size: 32, // 16pt
          color: '5B2C16',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'Haymete Abraham Sunday School Academic Management Portal',
          bold: true,
          size: 20, // 10pt
          color: '8C502E',
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: subtitle ? 80 : 180 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 24, // 12pt
          color: '27140B',
          font: 'Arial',
        }),
      ],
    }),
  ];

  if (subtitle) {
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: subtitle,
            italics: true,
            size: 19, // 9.5pt
            color: '666666',
            font: 'Arial',
          }),
        ],
      })
    );
  }

  return paragraphs;
}

// Common Footer note
function createFooterParagraph(): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240 },
    children: [
      new TextRun({
        text: `Generated automatically on ${formatEthiopianDate(new Date(), 'am')} (${formatEthiopianDate(new Date(), 'en')}) — Official Sunday School Record`,
        italics: true,
        size: 16,
        color: '888888',
        font: 'Arial',
      }),
    ],
  });
}

// Signatures block table
function createSignaturesTable(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: transparentBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: transparentBorders,
            children: [
              new Paragraph({
                spacing: { before: 200, after: 300 },
                children: [
                  new TextRun({
                    text: 'የክፍሉ መምህር / Class Teacher:',
                    bold: true,
                    size: 19,
                    color: '27140B',
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'ፊርማ (Signature): _____________________  ቀን (Date): ____________',
                    size: 18,
                    color: '555555',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: transparentBorders,
            children: [
              new Paragraph({
                spacing: { before: 200, after: 300 },
                children: [
                  new TextRun({
                    text: 'የትምህርት ክፍል ኃላፊ / Academic Head:',
                    bold: true,
                    size: 19,
                    color: '27140B',
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'ፊርማ (Signature): _____________________  ማህተም (Seal): _________',
                    size: 18,
                    color: '555555',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * 1. Export Daily Attendance Sheet to Word (.docx)
 */
export async function exportAttendanceToWord(params: {
  className: string;
  classAmharicName?: string;
  date: string;
  recordedBy: string;
  entries: {
    studentCode: string;
    studentName: string;
    studentAmharicName?: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remark?: string;
  }[];
  summary: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    rate: number;
  };
  language?: 'en' | 'am';
}) {
  const { className, classAmharicName, date, recordedBy, entries, summary, language = 'am' } = params;
  const ethiopianDate = formatEthiopianDate(date, language, true);

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: 'F9F5F0', type: ShadingType.CLEAR, color: 'auto' },
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: 'ክፍል / Class:', bold: true, size: 19, color: '5B2C16' })] })],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${className} ${classAmharicName ? `(${classAmharicName})` : ''}`,
                    bold: true,
                    size: 19,
                    color: '111111',
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: 'F9F5F0', type: ShadingType.CLEAR, color: 'auto' },
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: 'ቀን / Date:', bold: true, size: 19, color: '5B2C16' })] })],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${ethiopianDate} `, bold: true, size: 19 }),
                  new TextRun({ text: `(${date})`, size: 17, color: '666666' }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'F9F5F0', type: ShadingType.CLEAR, color: 'auto' },
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: 'የመዘገበው / Recorded By:', bold: true, size: 19, color: '5B2C16' })] })],
          }),
          new TableCell({
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: recordedBy || 'Academic Teacher', size: 19 })] })],
          }),
          new TableCell({
            shading: { fill: 'F9F5F0', type: ShadingType.CLEAR, color: 'auto' },
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: 'የመገኘት መጠን / Rate:', bold: true, size: 19, color: '5B2C16' })] })],
          }),
          new TableCell({
            borders: cellBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${summary.rate}%`, bold: true, size: 20, color: '5B2C16' }),
                  new TextRun({ text: ` (${summary.present + summary.late}/${summary.total} Attended)`, size: 17, color: '555555' }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: 'F9F5F0', type: ShadingType.CLEAR, color: 'auto' },
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: 'ስታቲስቲክስ / Summary:', bold: true, size: 19, color: '5B2C16' })] })],
          }),
          new TableCell({
            columnSpan: 3,
            borders: cellBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `Present: ${summary.present}  •  `, bold: true, color: '155724', size: 19 }),
                  new TextRun({ text: `Absent: ${summary.absent}  •  `, bold: true, color: '721C24', size: 19 }),
                  new TextRun({ text: `Late: ${summary.late}  •  `, bold: true, color: '856404', size: 19 }),
                  new TextRun({ text: `Excused: ${summary.excused}  •  `, bold: true, color: '004085', size: 19 }),
                  new TextRun({ text: `Total: ${summary.total}`, bold: true, color: '27140B', size: 19 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Table Headers
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF', size: 18 })] })],
      }),
      new TableCell({
        width: { size: 46, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ children: [new TextRun({ text: 'Student Full Name (የተማሪው ስም)', bold: true, color: 'FFFFFF', size: 18 })] })],
      }),
      new TableCell({
        width: { size: 23, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Status / መገኘት', bold: true, color: 'FFFFFF', size: 18 })] })],
      }),
      new TableCell({
        width: { size: 23, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ children: [new TextRun({ text: 'Remarks / ማስታወሻ', bold: true, color: 'FFFFFF', size: 18 })] })],
      }),
    ],
  });

  // Ensure entries are sorted alphabetically by student name
  const sortedEntries = [...entries].sort((a, b) => {
    const nameA = (a.studentName || '').toLowerCase();
    const nameB = (b.studentName || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Table Data Rows
  const dataRows = sortedEntries.map((entry, index) => {
    let statusText = 'Present / ተገኝቷል';
    let statusColor = '155724';
    let statusBg = 'E8F5E9';

    if (entry.status === 'ABSENT') {
      statusText = 'Absent / ቀርቷል';
      statusColor = '721C24';
      statusBg = 'FFEBEE';
    } else if (entry.status === 'LATE') {
      statusText = 'Late / ዘግይቷል';
      statusColor = '856404';
      statusBg = 'FFF8E1';
    } else if (entry.status === 'EXCUSED') {
      statusText = 'Excused / ፈቃድ';
      statusColor = '004085';
      statusBg = 'E3F2FD';
    }

    const rowBg = index % 2 === 1 ? 'FAF8F5' : 'FFFFFF';

    return new TableRow({
      children: [
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${index + 1}`, size: 18, color: '666666' })] })],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: entry.studentName, bold: true, size: 18 }),
                ...(entry.studentAmharicName ? [new TextRun({ text: ` (${entry.studentAmharicName})`, size: 17, color: '666666' })] : []),
              ],
            }),
          ],
        }),
        new TableCell({
          shading: { fill: statusBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: statusText, bold: true, size: 17, color: statusColor })],
            }),
          ],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [new Paragraph({ children: [new TextRun({ text: entry.remark || '-', size: 17, color: '444444' })] })],
        }),
      ],
    });
  });

  const attendanceTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [headerRow, ...dataRows],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.7),
              right: convertInchesToTwip(0.7),
              bottom: convertInchesToTwip(0.7),
              left: convertInchesToTwip(0.7),
            },
          },
        },
        children: [
          ...createChurchHeader(
            'የተማሪዎች ዕለታዊ የመገኘት መመዝገቢያ ቅጽ / Daily Attendance Register',
            `${className} ${classAmharicName ? `(${classAmharicName})` : ''} — ${ethiopianDate} (${date})`
          ),
          metaTable,
          new Paragraph({ spacing: { before: 140, after: 100 }, children: [] }),
          attendanceTable,
          new Paragraph({ spacing: { before: 140, after: 100 }, children: [] }),
          createSignaturesTable(),
          createFooterParagraph(),
        ],
      },
    ],
  });

  const safeClassName = className.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Attendance_${safeClassName}_${date}.docx`;
  await saveDocxBlob(doc, filename);
}

/**
 * 2. Export Multi-Day Historical Attendance Logs to Word (.docx)
 */
export async function exportAttendanceHistoryToWord(params: {
  className: string;
  classAmharicName?: string;
  historyRecords: {
    date: string;
    takenByUserName: string;
    entries: {
      studentCode: string;
      studentName: string;
      status: string;
    }[];
  }[];
  language?: 'en' | 'am';
}) {
  const { className, classAmharicName, historyRecords, language = 'am' } = params;

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { fill: 'F9F5F0', type: ShadingType.CLEAR, color: 'auto' },
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: 'ክፍል / Class:', bold: true, size: 19, color: '5B2C16' })] })],
          }),
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: `${className} ${classAmharicName ? `(${classAmharicName})` : ''}`, bold: true, size: 19 })] })],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: 'F9F5F0', type: ShadingType.CLEAR, color: 'auto' },
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: 'ጠቅላላ መዝገቦች / Total Logs:', bold: true, size: 19, color: '5B2C16' })] })],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [new Paragraph({ children: [new TextRun({ text: `${historyRecords.length} Days Recorded`, bold: true, size: 19 })] })],
          }),
        ],
      }),
    ],
  });

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 6, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF', size: 18 })] })],
      }),
      new TableCell({
        width: { size: 24, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ children: [new TextRun({ text: 'ቀን / Date', bold: true, color: 'FFFFFF', size: 18 })] })],
      }),
      new TableCell({
        width: { size: 22, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ children: [new TextRun({ text: 'የመዘገበው / Recorded By', bold: true, color: 'FFFFFF', size: 18 })] })],
      }),
      new TableCell({
        width: { size: 10, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Present', bold: true, color: 'FFFFFF', size: 17 })] })],
      }),
      new TableCell({
        width: { size: 10, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Absent', bold: true, color: 'FFFFFF', size: 17 })] })],
      }),
      new TableCell({
        width: { size: 10, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Late', bold: true, color: 'FFFFFF', size: 17 })] })],
      }),
      new TableCell({
        width: { size: 18, type: WidthType.PERCENTAGE },
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Attendance Rate', bold: true, color: 'FFFFFF', size: 17 })] })],
      }),
    ],
  });

  const dataRows = historyRecords.map((rec, index) => {
    const pCount = rec.entries.filter((e) => e.status === 'PRESENT').length;
    const aCount = rec.entries.filter((e) => e.status === 'ABSENT').length;
    const lCount = rec.entries.filter((e) => e.status === 'LATE').length;
    const total = rec.entries.length;
    const rate = total > 0 ? Math.round(((pCount + lCount) / total) * 100) : 0;
    const ethDate = formatEthiopianDate(rec.date, language, true);

    const rowBg = index % 2 === 1 ? 'FAF8F5' : 'FFFFFF';

    return new TableRow({
      children: [
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${index + 1}`, size: 18, color: '666666' })] })],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: ethDate, bold: true, size: 18 }),
                new TextRun({ text: ` (${rec.date})`, size: 16, color: '666666' }),
              ],
            }),
          ],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [new Paragraph({ children: [new TextRun({ text: rec.takenByUserName || 'Academic Teacher', size: 18 })] })],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${pCount}`, bold: true, color: '155724', size: 18 })] })],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${aCount}`, bold: true, color: '721C24', size: 18 })] })],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${lCount}`, bold: true, color: '856404', size: 18 })] })],
        }),
        new TableCell({
          shading: { fill: 'F9F5F0', type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${rate}%`, bold: true, color: '5B2C16', size: 19 })] })],
        }),
      ],
    });
  });

  const historyTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [headerRow, ...dataRows],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.7),
              right: convertInchesToTwip(0.7),
              bottom: convertInchesToTwip(0.7),
              left: convertInchesToTwip(0.7),
            },
          },
        },
        children: [
          ...createChurchHeader(
            'የተማሪዎች የመገኘት ታሪክ ማጠቃለያ ሪፖርት / Attendance History Summary Report',
            `${className} ${classAmharicName ? `(${classAmharicName})` : ''} — Complete Records`
          ),
          metaTable,
          new Paragraph({ spacing: { before: 140, after: 100 }, children: [] }),
          historyTable,
          new Paragraph({ spacing: { before: 140, after: 100 }, children: [] }),
          createSignaturesTable(),
          createFooterParagraph(),
        ],
      },
    ],
  });

  const safeClassName = className.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Attendance_History_${safeClassName}.docx`;
  await saveDocxBlob(doc, filename);
}

/**
 * Exports Academic Calendar Events into an official branded Word (.docx) Document
 */
export async function exportAcademicCalendarToWord(
  events: Array<{
    id: string;
    title: string;
    amharicTitle: string;
    type: string;
    startDate: string;
    endDate?: string;
    academicYear: string;
    semester?: string;
    description?: string;
    amharicDescription?: string;
    location?: string;
    targetAudience?: string;
    isImportant?: boolean;
  }>,
  academicYear: string = '2026/2027',
  filterCategory: string = 'All'
) {
  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: transparentBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: transparentBorders,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Academic Year / የትምህርት ዘመን: ', bold: true, color: '5B2C16', size: 20 }),
                  new TextRun({ text: academicYear, size: 20 }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'Category Filter / ምድብ: ', bold: true, color: '5B2C16', size: 20 }),
                  new TextRun({ text: filterCategory, size: 20 }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: transparentBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Generated Date / የተዘጋጀበት ቀን: ', bold: true, color: '5B2C16', size: 20 }),
                  new TextRun({ text: formatEthiopianDate(new Date(), 'am', true), size: 20 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Total Key Milestones: ', bold: true, color: '5B2C16', size: 20 }),
                  new TextRun({ text: `${events.length} Events`, bold: true, color: 'D97706', size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '#', bold: true, color: 'FFFFFF', size: 19 })] })],
      }),
      new TableCell({
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ children: [new TextRun({ text: 'Event Title / መርሐ ግብር', bold: true, color: 'FFFFFF', size: 19 })] })],
      }),
      new TableCell({
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Category / ዓይነት', bold: true, color: 'FFFFFF', size: 19 })] })],
      }),
      new TableCell({
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Ethiopian Date / የኢትዮጵያ ቀን', bold: true, color: 'FFFFFF', size: 19 })] })],
      }),
      new TableCell({
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Gregorian Date', bold: true, color: 'FFFFFF', size: 19 })] })],
      }),
      new TableCell({
        shading: { fill: '5B2C16', type: ShadingType.CLEAR, color: 'auto' },
        borders: cellBorders,
        children: [new Paragraph({ children: [new TextRun({ text: 'Audience & Venue / ዝርዝር', bold: true, color: 'FFFFFF', size: 19 })] })],
      }),
    ],
  });

  const categoryLabels: Record<string, string> = {
    EXAM: 'Exam Week / የፈተና ሳምንት',
    HOLIDAY: 'Holiday & Feast / በዓል',
    REGISTRATION: 'Registration / ምዝገባ',
    ACADEMIC_MILESTONE: 'Academic Milestone / ክንውን',
    MEETING: 'Meeting / ስብሰባ',
    SPECIAL_EVENT: 'Special / መንፈሳዊ',
  };

  const dataRows = events.map((evt, index) => {
    const rowBg = index % 2 === 0 ? 'FFFFFF' : 'FCF9F5';
    const ethStart = formatEthiopianDate(evt.startDate, 'am');
    const ethEnd = evt.endDate && evt.endDate !== evt.startDate ? ` - ${formatEthiopianDate(evt.endDate, 'am')}` : '';
    const gregDateStr = evt.endDate && evt.endDate !== evt.startDate ? `${evt.startDate} to ${evt.endDate}` : evt.startDate;

    return new TableRow({
      children: [
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${index + 1}`, size: 18 })] })],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [
            new Paragraph({ children: [new TextRun({ text: evt.amharicTitle || evt.title, bold: true, color: '27140B', size: 19 })] }),
            new Paragraph({ children: [new TextRun({ text: evt.title, color: '6B4B3E', size: 17, italics: true })] }),
            ...(evt.description
              ? [new Paragraph({ spacing: { before: 40 }, children: [new TextRun({ text: evt.description, size: 16, color: '7D6A5D' })] })]
              : []),
          ],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: categoryLabels[evt.type] || evt.type,
                  bold: true,
                  color: evt.type === 'EXAM' ? 'B91C1C' : evt.type === 'HOLIDAY' ? '15803D' : 'B45309',
                  size: 17,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `${ethStart}${ethEnd}`, bold: true, color: '5B2C16', size: 18 })],
            }),
          ],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: gregDateStr, size: 17, color: '555555' })],
            }),
          ],
        }),
        new TableCell({
          shading: { fill: rowBg, type: ShadingType.CLEAR, color: 'auto' },
          borders: cellBorders,
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: `Audience: ${evt.targetAudience || 'ALL'}`, bold: true, size: 17, color: '27140B' }),
              ],
            }),
            ...(evt.location
              ? [new Paragraph({ children: [new TextRun({ text: `Venue: ${evt.location}`, size: 16, color: '6B4B3E' })] })]
              : []),
          ],
        }),
      ],
    });
  });

  const calendarTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    rows: [headerRow, ...dataRows],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.7),
              right: convertInchesToTwip(0.7),
              bottom: convertInchesToTwip(0.7),
              left: convertInchesToTwip(0.7),
            },
          },
        },
        children: [
          ...createChurchHeader(
            'ይፋዊ የሰንበት ትምህርት ቤት የትምህርት ካላንደር / Official Academic Calendar',
            `Haymete Abraham Sunday School — Academic Year ${academicYear}`
          ),
          metaTable,
          new Paragraph({ spacing: { before: 140, after: 100 }, children: [] }),
          calendarTable,
          new Paragraph({ spacing: { before: 140, after: 100 }, children: [] }),
          createSignaturesTable(),
          createFooterParagraph(),
        ],
      },
    ],
  });

  const filename = `Academic_Calendar_${academicYear.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  await saveDocxBlob(doc, filename);
}
