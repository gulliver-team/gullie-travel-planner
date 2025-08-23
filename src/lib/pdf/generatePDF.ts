import html2pdf from 'html2pdf.js';

interface PDFData {
  name: string;
  email: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  visaOptions: string;
  timestamp: string;
}

export async function generatePDFBlob(data: PDFData): Promise<Blob> {
  const htmlContent = `
    <div id="pdf-content" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; margin: -40px -40px 30px -40px;">
        <h1 style="margin: 0; font-size: 28px;">Your Relocation Report</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">From ${data.originCity}, ${data.originCountry} to ${data.destinationCity}, ${data.destinationCountry}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; margin-bottom: 10px;">Dear ${data.name},</p>
        <p style="font-size: 14px; line-height: 1.6; color: #666;">Thank you for using Gullie for your relocation planning. Based on our analysis, here's your comprehensive relocation report.</p>
      </div>
      
      <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0;">
        <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">📋 Visa Options Summary</h2>
        <div style="font-size: 14px; line-height: 1.8; color: #333;">
          ${formatVisaOptions(data.visaOptions)}
        </div>
      </div>
      
      <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0;">
        <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">📅 Recommended Timeline</h2>
        <ul style="font-size: 14px; line-height: 1.8; color: #333;">
          <li><strong>Month 1:</strong> Research and document gathering</li>
          <li><strong>Month 2:</strong> Visa application submission</li>
          <li><strong>Month 3:</strong> Housing arrangements and travel booking</li>
          <li><strong>Month 4:</strong> Final preparations and relocation</li>
        </ul>
      </div>
      
      <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0;">
        <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">📄 Document Checklist</h2>
        <ul style="font-size: 14px; line-height: 1.8; color: #333;">
          <li>Valid passport (6+ months validity)</li>
          <li>Visa application forms</li>
          <li>Proof of funds/bank statements</li>
          <li>Employment letter/contract</li>
          <li>Housing proof/rental agreement</li>
          <li>Health insurance documentation</li>
          <li>Educational certificates (if applicable)</li>
          <li>Criminal background check</li>
        </ul>
      </div>
      
      <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0;">
        <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">💡 Next Steps</h2>
        <ol style="font-size: 14px; line-height: 1.8; color: #333;">
          <li><strong>Choose your visa type</strong> based on your circumstances and timeline</li>
          <li><strong>Gather all required documents</strong> from the checklist above</li>
          <li><strong>Book visa appointment</strong> at the nearest consulate/embassy</li>
          <li><strong>Arrange housing</strong> in ${data.destinationCity}</li>
          <li><strong>Book flights</strong> once visa is approved</li>
        </ol>
      </div>
      
      <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 30px 0;">
        <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">🔗 Helpful Resources</h2>
        <ul style="font-size: 14px; line-height: 1.8; color: #333;">
          <li>Official Immigration Website for ${data.destinationCountry}</li>
          <li>Embassy/Consulate contact information</li>
          <li>Local expat communities and forums</li>
          <li>Housing platforms for ${data.destinationCity}</li>
        </ul>
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
        <p style="font-size: 14px; color: #666;">
          <strong>Need more help?</strong> Contact us through our AI assistant for personalized guidance.
        </p>
        <p style="font-size: 14px; color: #666;">
          Best regards,<br>
          The Gullie Team
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
        <p style="font-size: 12px; color: #999;">© 2024 Gullie Travel Planner. All rights reserved.</p>
        <p style="font-size: 12px; color: #999;">This report was generated on ${new Date(data.timestamp).toLocaleDateString()}</p>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  const options = {
    margin: 10,
    filename: `relocation-report-${data.destinationCity.toLowerCase()}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  try {
    const element = container.firstElementChild;
    if (!element) {
      throw new Error('No content to generate PDF');
    }
    
    const pdfOutput = await html2pdf()
      .set(options)
      .from(element)
      .outputPdf('blob');
    
    const pdfBlob = pdfOutput as Blob;
    
    document.body.removeChild(container);
    return pdfBlob;
  } catch (error) {
    document.body.removeChild(container);
    throw error;
  }
}

function formatVisaOptions(visaOptions: string): string {
  if (!visaOptions) {
    return "<p>Detailed visa information will be provided based on your specific situation.</p>";
  }
  
  const formatted = visaOptions
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '</li><li>')
    .replace(/(\d+\. )/g, '</li><li>');
  
  return formatted;
}