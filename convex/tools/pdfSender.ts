import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { Resend } from "resend";

export const sendPDFReport = internalAction({
  args: {
    email: v.string(),
    consultationData: v.any(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { email, consultationData, storageId } = args;

    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        throw new Error("Missing Resend API key");
      }

      const resend = new Resend(resendApiKey);

      // Create formatted email content
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9fafb; }
        .section { margin: 20px 0; padding: 20px; background: white; border-left: 4px solid #667eea; }
        .section h2 { color: #667eea; margin-top: 0; }
        .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        ul { padding-left: 20px; }
        .highlight { background: #fef3c7; padding: 2px 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Relocation Report</h1>
            <p>From ${consultationData.originCity}, ${consultationData.originCountry} to ${consultationData.destinationCity}, ${consultationData.destinationCountry}</p>
        </div>
        
        <div class="content">
            <p>Dear ${consultationData.name || 'Valued Client'},</p>
            
            <p>Thank you for using Gullie for your relocation planning. Based on our analysis, here's your comprehensive relocation report.</p>
            
            <div class="section">
                <h2>📋 Visa Options Summary</h2>
                ${formatVisaOptions(consultationData.visaOptions)}
            </div>
            
            <div class="section">
                <h2>📅 Recommended Timeline</h2>
                <ul>
                    <li><strong>Month 1:</strong> Research and document gathering</li>
                    <li><strong>Month 2:</strong> Visa application submission</li>
                    <li><strong>Month 3:</strong> Housing arrangements and travel booking</li>
                    <li><strong>Month 4:</strong> Final preparations and relocation</li>
                </ul>
            </div>
            
            <div class="section">
                <h2>📄 Document Checklist</h2>
                <ul>
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
            
            <div class="section">
                <h2>💡 Next Steps</h2>
                <ol>
                    <li><strong>Choose your visa type</strong> based on your circumstances and timeline</li>
                    <li><strong>Gather all required documents</strong> from the checklist above</li>
                    <li><strong>Book visa appointment</strong> at the nearest consulate/embassy</li>
                    <li><strong>Arrange housing</strong> in ${consultationData.destinationCity}</li>
                    <li><strong>Book flights</strong> once visa is approved</li>
                </ol>
            </div>
            
            <div class="section">
                <h2>🔗 Helpful Resources</h2>
                <ul>
                    <li>Official Immigration Website for ${consultationData.destinationCountry}</li>
                    <li>Embassy/Consulate contact information</li>
                    <li>Local expat communities and forums</li>
                    <li>Housing platforms for ${consultationData.destinationCity}</li>
                </ul>
            </div>
            
            <p style="margin-top: 30px;">
                <strong>Need more help?</strong> Reply to this email or call us directly through our AI assistant for personalized guidance.
            </p>
            
            <p>Best regards,<br>
            The Gullie Team</p>
        </div>
        
        <div class="footer">
            <p>© 2024 Gullie Travel Planner. All rights reserved.</p>
            <p>This report was generated on ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
</body>
</html>
      `;

      // Prepare attachments if PDF storageId is provided
      const attachments = [];
      if (storageId) {
        const pdfBlob = await ctx.storage.get(storageId);
        if (pdfBlob) {
          const arrayBuffer = await pdfBlob.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          attachments.push({
            filename: `relocation-report-${consultationData.destinationCity?.toLowerCase() || 'report'}.pdf`,
            content: base64,
            contentType: 'application/pdf',
          });
        }
      }

      // Send email
      const { data, error } = await resend.emails.send({
        from: 'Gullie Travel Planner <onboarding@resend.dev>',
        to: email,
        subject: `Your Relocation Report: ${consultationData.originCity} to ${consultationData.destinationCity}`,
        html: emailHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (error) {
        throw error;
      }

      // Update user record
      await ctx.runMutation(internal.tools.updateUserReport.updateUserReportStatus, {
        email
      });

      console.log("Email sent successfully:", data);
      return {
        success: true,
        message: "Report sent successfully",
        emailId: data?.id,
      };
    } catch (error) {
      console.error("Error sending email report:", error);
      throw new Error("Failed to send email report");
    }
  },
});

function formatVisaOptions(visaOptions: string): string {
  if (!visaOptions) {
    return "<p>Detailed visa information will be provided based on your specific situation.</p>";
  }
  
  // Convert markdown-style formatting to HTML
  const formatted = visaOptions
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '<li>')
    .replace(/(\d+\. )/g, '<li>');
  
  return `<div>${formatted}</div>`;
}