import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project, ProjectRequirement, Meeting, STATUS_LABELS } from '@/types/database';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectPDFData {
  project: Project;
  requirements: ProjectRequirement[];
  meetings: Meeting[];
  tags?: string[];
}

export function generateProjectPDF({ project, requirements, meetings, tags }: ProjectPDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Helper to add colored header bar
  const addColorBar = () => {
    const color = hexToRgb(project.visual_identity);
    doc.setFillColor(color.r, color.g, color.b);
    doc.rect(0, 0, pageWidth, 35, 'F');
  };

  // Helper to convert hex to RGB
  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 99, g: 102, b: 241 }; // default indigo
  }

  // Header with color bar
  addColorBar();
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(project.name, 15, 22);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(STATUS_LABELS[project.status], 15, 30);

  // Reset text color
  doc.setTextColor(30, 30, 30);
  yPos = 50;

  // Project Info Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informações do Projeto', 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const projectInfo = [
    ['Status', STATUS_LABELS[project.status]],
    ['Criado em', format(parseISO(project.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })],
  ];

  if (project.deadline_start || project.deadline_end) {
    projectInfo.push([
      'Prazo',
      `${project.deadline_start ? format(parseISO(project.deadline_start), 'dd/MM/yyyy') : '-'} a ${project.deadline_end ? format(parseISO(project.deadline_end), 'dd/MM/yyyy') : '-'}`,
    ]);
  }

  if (tags && tags.length > 0) {
    projectInfo.push(['Categorias', tags.join(', ')]);
  }

  projectInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}: `, 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 15 + doc.getTextWidth(`${label}: `), yPos);
    yPos += 6;
  });

  yPos += 10;

  // Client Info Section
  if (project.client_name || project.client_email || project.client_phone || project.client_company) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Dados do Cliente', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    const clientInfo = [
      project.client_name && ['Nome', project.client_name],
      project.client_email && ['Email', project.client_email],
      project.client_phone && ['Telefone', project.client_phone],
      project.client_company && ['Empresa', project.client_company],
    ].filter(Boolean) as [string, string][];

    clientInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}: `, 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 15 + doc.getTextWidth(`${label}: `), yPos);
      yPos += 6;
    });

    yPos += 10;
  }

  // Budget Section
  if (project.budget_value || project.budget_payment_method) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Orçamento', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    if (project.budget_value) {
      doc.setFont('helvetica', 'bold');
      doc.text('Valor: ', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`R$ ${project.budget_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 15 + doc.getTextWidth('Valor: '), yPos);
      yPos += 6;
    }

    if (project.budget_payment_method) {
      doc.setFont('helvetica', 'bold');
      doc.text('Pagamento: ', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(project.budget_payment_method, 15 + doc.getTextWidth('Pagamento: '), yPos);
      yPos += 6;
    }

    yPos += 10;
  }

  // Design Preferences
  if (project.design_preferences) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Preferências de Design', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    const splitText = doc.splitTextToSize(project.design_preferences, pageWidth - 30);
    doc.text(splitText, 15, yPos);
    yPos += splitText.length * 5 + 10;
  }

  // Requirements Section
  if (requirements.length > 0) {
    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Requisitos', 15, yPos);
    yPos += 5;

    const completedCount = requirements.filter(r => r.completed).length;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`${completedCount} de ${requirements.length} concluídos`, 15, yPos + 5);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Status', 'Requisito', 'Descrição']],
      body: requirements.map((req) => [
        req.completed ? '✓' : '○',
        req.title,
        req.description || '-',
      ]),
      headStyles: {
        fillColor: hexToRgb(project.visual_identity) as any,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 'auto' },
      },
      margin: { left: 15, right: 15 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Meetings Section
  if (meetings.length > 0) {
    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Histórico de Reuniões', 15, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Data', 'Anotações']],
      body: meetings.map((meeting) => [
        format(parseISO(meeting.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
        meeting.notes || '-',
      ]),
      headStyles: {
        fillColor: hexToRgb(project.visual_identity) as any,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 15, right: 15 },
    });
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Download
  const fileName = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
}
