import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { Resend } from "resend";
import { render } from '@react-email/render';
import { RelocationReport } from '../emails/RelocationReport';
import {
  PDFSenderInputSchema,
  PDFSenderOutputSchema,
  type PDFSenderInput,
  type PDFSenderOutput,
} from "../schemas/zod_schemas";

export const sendEmailReport = internalAction({
  args: {
    email: v.string(),
    consultationData: v.any(),
  },
  handler: async (ctx, args): Promise<PDFSenderOutput> => {
    // Validate input using Zod schema
    const validatedInput: PDFSenderInput = PDFSenderInputSchema.parse(args);

    const { email, consultationData } = validatedInput;

    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        throw new Error("Missing Resend API key");
      }

      const resend = new Resend(resendApiKey);

      // Create formatted email content using React Email
      const emailHtml = await render(
        RelocationReport({
          name: consultationData.name || 'Valued Client',
          email,
          originCity: consultationData.originCity,
          originCountry: consultationData.originCountry,
          destinationCity: consultationData.destinationCity,
          destinationCountry: consultationData.destinationCountry,
          visaOptions: consultationData.visaOptions,
        })
      );


      // Send email
      const { data, error } = await resend.emails.send({
        from: "Gullie Travel Planner <onboarding@resend.dev>",
        to: email,
        subject: `Your Relocation Report: ${consultationData.originCity} to ${consultationData.destinationCity}`,
        html: emailHtml,
      });

      if (error) {
        throw error;
      }

      // Update user record
      await ctx.runMutation(
        internal.tools.updateUserReport.updateUserReportStatus,
        {
          email,
        }
      );

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
