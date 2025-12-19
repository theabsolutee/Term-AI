
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalysisResult, Theme } from "../types";

export async function exportToPdf(result: AnalysisResult, theme: Theme) {
  const doc = new jsPDF();
  const isDark = theme === 'dark';
  
  // Colors
  const bgColor = isDark ? [30, 41, 59] : [255, 255, 255];
  const textColor = isDark ? [248, 250, 252] : [15, 23, 42];
  const accentColor = [99, 102, 241]; // Indigo-500
  const secondaryTextColor = isDark ? [148, 163, 184] : [71, 85, 105];

  // Set page background
  if (isDark) {
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(0, 0, 210, 297, 'F');
  }

  // Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("TERM AI", 14, 15);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(result.title, 14, 30);

  // Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 38);

  // Summary
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(secondaryTextColor[0], secondaryTextColor[1], secondaryTextColor[2]);
  const splitSummary = doc.splitTextToSize(result.summary, 180);
  doc.text(splitSummary, 14, 50);

  // Table
  autoTable(doc, {
    startY: 65,
    head: [['Term', 'Definition']],
    body: result.definitions.map(d => [d.term, d.definition]),
    styles: {
      fillColor: isDark ? [51, 65, 85] : [248, 250, 252],
      textColor: isDark ? [248, 250, 252] : [15, 23, 42],
      fontSize: 11,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: accentColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: isDark ? [30, 41, 59] : [255, 255, 255],
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${result.title.replace(/\s+/g, '_')}_Study_Guide.pdf`);
}
