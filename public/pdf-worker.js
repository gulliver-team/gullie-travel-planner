// PDF Generation Web Worker
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;
  
  if (type === 'GENERATE_PDF') {
    try {
      const pdf = await generatePDF(data);
      self.postMessage({
        type: 'PDF_COMPLETE',
        data: pdf
      });
    } catch (error) {
      self.postMessage({
        type: 'PDF_ERROR',
        error: error.message
      });
    }
  }
});

async function generatePDF(data) {
  const { jsPDF } = self.jspdf;
  const doc = new jsPDF();
  
  const {
    userName,
    email,
    phone,
    fromCity,
    toCity,
    selectedOption,
    searchResults,
    generatedAt
  } = data;
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(0, 255, 136);
  doc.text('GULLIE', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('Global Mobility Expert Report', 20, 40);
  
  // User Information
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Relocation Plan', 20, 60);
  
  doc.setFontSize(10);
  doc.text(`Name: ${userName}`, 20, 70);
  doc.text(`Email: ${email}`, 20, 77);
  doc.text(`Phone: ${phone}`, 20, 84);
  doc.text(`Route: ${fromCity} → ${toCity}`, 20, 91);
  doc.text(`Generated: ${new Date(generatedAt).toLocaleDateString()}`, 20, 98);
  
  // Selected Option Details
  doc.setFontSize(14);
  doc.text(`Selected: ${selectedOption.title}`, 20, 115);
  
  doc.setFontSize(10);
  let yPos = 125;
  
  // Visa Information
  doc.setFontSize(12);
  doc.text('Visa Requirements', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Type: ${selectedOption.visaType}`, 25, yPos);
  yPos += 7;
  doc.text(`Timeline: ${selectedOption.timeline}`, 25, yPos);
  yPos += 7;
  doc.text(`Cost: ${selectedOption.totalCost}`, 25, yPos);
  yPos += 15;
  
  // Key Highlights
  doc.setFontSize(12);
  doc.text('Key Features', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  if (selectedOption.highlights) {
    selectedOption.highlights.forEach((highlight) => {
      doc.text(`• ${highlight}`, 25, yPos);
      yPos += 7;
    });
  }
  
  // All Options Summary
  yPos += 10;
  doc.setFontSize(12);
  doc.text('All Options Comparison', 20, yPos);
  yPos += 10;
  
  const options = ['cheapest', 'fastest', 'convenient', 'premium'];
  options.forEach((optionType) => {
    const option = searchResults[optionType];
    if (option) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`${option.title}:`, 25, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 7;
      doc.text(`${option.visaType} - ${option.timeline} - ${option.totalCost}`, 30, yPos);
      yPos += 10;
    }
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('This report is confidential and for personal use only.', 20, 270);
  doc.text('Gullie Global Mobility Expert - £1000/month after free trial', 20, 275);
  doc.text('Support available 24/7 via phone and web', 20, 280);
  
  // Convert to blob
  const pdfBlob = doc.output('blob');
  
  // Convert blob to base64 for transfer
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        base64: reader.result,
        blob: pdfBlob
      });
    };
    reader.readAsDataURL(pdfBlob);
  });
}