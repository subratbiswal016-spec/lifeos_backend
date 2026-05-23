import PDFDocument from 'pdfkit';

export const generateHealthReportPDF = async (member, visits, symptoms, res) => {
  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(20).text(`Health Report: ${member.name}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Age: ${member.age} | Blood Group: ${member.bloodGroup}`);
  doc.moveDown();

  doc.fontSize(16).text('Recent Doctor Visits:', { underline: true });
  visits.forEach(visit => {
    doc.fontSize(12).text(`Date: ${visit.date} | Doctor: ${visit.doctorName}`);
    doc.text(`Reason: ${visit.reason}`);
    doc.moveDown();
  });

  doc.fontSize(16).text('Recent Symptoms:', { underline: true });
  symptoms.forEach(symptom => {
    doc.fontSize(12).text(`Date: ${symptom.date}`);
    if (symptom.temperature) doc.text(`Temp: ${symptom.temperature}°C`);
    if (symptom.bpSystolic && symptom.bpDiastolic) doc.text(`BP: ${symptom.bpSystolic}/${symptom.bpDiastolic}`);
    doc.moveDown();
  });

  doc.end();
};

export const generateStudyReportPDF = async (user, sessions, tests, res) => {
  const doc = new PDFDocument();
  doc.pipe(res);

  doc.fontSize(20).text(`Study Progress Report: ${user.name}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(16).text('Recent Study Sessions:', { underline: true });
  sessions.forEach(session => {
    doc.fontSize(12).text(`Date: ${session.date} | Subject: ${session.subjectId?.name || 'Unknown'}`);
    doc.text(`Duration: ${session.durationMinutes} mins`);
    doc.moveDown();
  });

  doc.fontSize(16).text('Mock Test Scores:', { underline: true });
  tests.forEach(test => {
    doc.fontSize(12).text(`Date: ${test.date} | Subject: ${test.subjectId?.name || 'Unknown'}`);
    doc.text(`Score: ${test.scoredMarks}/${test.totalMarks} (${test.percentage}%)`);
    doc.moveDown();
  });

  doc.end();
};
