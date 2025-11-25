import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Schedule, ScheduleEntry } from '@/types/schedule';

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const PERIODS = [1, 2, 3, 4, 5, 6];

export const exportToPDF = (schedule: Schedule, viewMode: 'by-class' | 'by-teacher', filter: string) => {
  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(16);
  doc.text(`Grade de Horários - ${filter}`, 14, 15);
  
  // Info
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);
  if (schedule.fitnessScore) {
    doc.text(`Qualidade: ${schedule.fitnessScore.toFixed(1)}%`, 14, 27);
  }
  
  // Prepare table data
  const headers = ['Horário', ...DAYS];
  const rows = PERIODS.map(period => {
    const row = [`${period}º horário`];
    
    DAYS.forEach(day => {
      const entries = schedule.entries.filter(entry => {
        const matchesSlot = entry.timeSlot.day === day && entry.timeSlot.period === period;
        if (viewMode === 'by-class') {
          return matchesSlot && entry.className === filter;
        } else {
          return matchesSlot && entry.teacherName === filter;
        }
      });
      
      if (entries.length > 0) {
        const cellContent = entries.map(e => 
          `${e.subjectName}\n${viewMode === 'by-class' ? e.teacherName : e.className}`
        ).join('\n---\n');
        row.push(cellContent);
      } else {
        row.push('-');
      }
    });
    
    return row;
  });
  
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 32,
    styles: { 
      fontSize: 8,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle'
    },
    headStyles: { 
      fillColor: [59, 130, 246],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left' }
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    }
  });
  
  // Save
  doc.save(`horario_${filter.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

export const exportToCSV = (schedule: Schedule, viewMode: 'by-class' | 'by-teacher', filter: string) => {
  // Prepare CSV data
  const headers = ['Horário', ...DAYS];
  const rows = [headers.join(',')];
  
  PERIODS.forEach(period => {
    const row = [`${period}º horário`];
    
    DAYS.forEach(day => {
      const entries = schedule.entries.filter(entry => {
        const matchesSlot = entry.timeSlot.day === day && entry.timeSlot.period === period;
        if (viewMode === 'by-class') {
          return matchesSlot && entry.className === filter;
        } else {
          return matchesSlot && entry.teacherName === filter;
        }
      });
      
      if (entries.length > 0) {
        const cellContent = entries.map(e => 
          `${e.subjectName} (${viewMode === 'by-class' ? e.teacherName : e.className})`
        ).join(' | ');
        row.push(`"${cellContent}"`);
      } else {
        row.push('-');
      }
    });
    
    rows.push(row.join(','));
  });
  
  // Create blob and download
  const csvContent = rows.join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `horario_${filter.replace(/\s+/g, '_')}_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAllToZip = async (schedule: Schedule, viewMode: 'by-class' | 'by-teacher') => {
  // For future implementation with JSZip
  console.log('Export all to ZIP - Coming soon');
};
