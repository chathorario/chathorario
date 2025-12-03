import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Schedule, ScheduleEntry } from '@/types/schedule';

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const PERIODS = [1, 2, 3, 4, 5, 6];

export const exportToPDF = (
  schedule: Schedule,
  viewMode: 'by-class' | 'by-teacher',
  filter: string,
  classes?: { id: string; name: string; bell_schedule?: any[]; horario_inicio?: string }[]
) => {
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
  let headers = ['Horário', ...DAYS];
  let rows: any[] = [];

  const currentClass = viewMode === 'by-class' && classes
    ? classes.find(c => c.name === filter)
    : null;

  const bellSchedule = currentClass?.bell_schedule || [];
  const horarioInicio = currentClass?.horario_inicio;

  if (viewMode === 'by-class' && bellSchedule.length > 0 && horarioInicio) {
    // Logic with Bell Schedule
    const addMinutes = (time: string, minutes: number) => {
      const [h, m] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(h, m);
      date.setMinutes(date.getMinutes() + minutes);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    let currentTime = horarioInicio.length > 5 ? horarioInicio.substring(0, 5) : horarioInicio;
    let lessonCounter = 0;

    bellSchedule.forEach((slot: any) => {
      const start = currentTime;
      const end = addMinutes(start, slot.duration);
      currentTime = end;

      if (slot.type === 'break') {
        rows.push([
          `${start} - ${end}`,
          { content: `Intervalo (${slot.duration} min)`, colSpan: 5, styles: { halign: 'center', fontStyle: 'italic', fillColor: [255, 248, 220] } }
        ]);
      } else {
        const period = lessonCounter + 1;
        const row = [`${period}º Aula\n${start} - ${end}`];

        DAYS.forEach(day => {
          const entries = schedule.entries.filter(entry => {
            return entry.timeSlot.day === day && entry.timeSlot.period === period && entry.className === filter;
          });

          if (entries.length > 0) {
            const cellContent = entries.map(e => e.subjectName + '\n' + e.teacherName).join('\n---\n');
            row.push(cellContent);
          } else {
            row.push('-');
          }
        });

        rows.push(row);
        lessonCounter++;
      }
    });

  } else {
    // Default Logic
    rows = PERIODS.map(period => {
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
  }

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
