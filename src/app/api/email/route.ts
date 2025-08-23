import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

//TODO: Add RESEND_API_KEY to .env.local
// Get from: https://resend.com/api-keys
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userName, pdfBase64, fromCity, toCity, selectedOption } = body;

    if (!email || !pdfBase64) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer for attachment
    const pdfBuffer = Buffer.from(
      pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
      "base64"
    );

    //TODO: Configure your domain in Resend dashboard
    // Replace 'noreply@yourdomain.com' with your verified domain
    const { data, error } = await resend.emails.send({
      from: "Gullie <noreply@yourdomain.com>",
      to: [email],
      subject: `Your Relocation Plan: ${fromCity} to ${toCity}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: monospace; background: #000; color: #fff; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; }
              .header { color: #00ff88; font-size: 24px; margin-bottom: 20px; }
              .content { background: #1a1a1a; padding: 20px; border: 1px solid #333; }
              .highlight { color: #00ffff; }
              .footer { margin-top: 20px; font-size: 12px; color: #666; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background: #00ff88; 
                color: #000; 
                text-decoration: none; 
                font-weight: bold;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">GULLIE</div>
              <div class="content">
                <h2>Hi ${userName},</h2>
                <p>Your personalized relocation plan from <span class="highlight">${fromCity}</span> to <span class="highlight">${toCity}</span> is ready!</p>
                
                <h3>Selected Option: ${selectedOption.title}</h3>
                <ul>
                  <li>Visa Type: ${selectedOption.visaType}</li>
                  <li>Timeline: ${selectedOption.timeline}</li>
                  <li>Total Cost: ${selectedOption.totalCost}</li>
                </ul>
                
                <p>Please find your comprehensive PDF report attached to this email.</p>
                
                <h3>Next Steps:</h3>
                <ol>
                  <li>Review the attached PDF for detailed information</li>
                  <li>Call us anytime for personalized support</li>
                  <li>Your first month is FREE - no charges until visa secured</li>
                </ol>
                
                <a href="https://yourdomain.com/subscribe" class="button">
                  Start Your Journey
                </a>
                
                <p style="margin-top: 30px;">
                  Our AI agents are available 24/7 to assist you with every step of your relocation.
                </p>
              </div>
              <div class="footer">
                <p>Gullie Global Mobility Expert</p>
                <p>£1000/month after free trial • Cancel anytime</p>
                <p>This email contains confidential information</p>
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `relocation-plan-${fromCity}-to-${toCity}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (error) {
    console.error("Email route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}