import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const getDocumentDetails = internalMutation({
  args: {
    documentType: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const { documentType, country } = args;

    const documentGuides: Record<string, any> = {
      "police clearance": {
        purpose: "Proves you have no criminal record",
        where: "Local police department or national agency",
        process: [
          "Apply online or in person at designated office",
          "Provide identification and address history",
          "Submit fingerprints (if required)",
          "Pay processing fee (usually £45-95)",
          "Wait 2-4 weeks for processing",
        ],
        validity: "Usually 6 months from issue date",
        tips: "Apply 2-3 months before visa application as it can take time",
      },
      "bank statement": {
        purpose: "Demonstrates financial stability",
        requirements: [
          "Last 6 months of statements",
          "Show minimum balance requirements",
          "Must be stamped by bank or certified",
          "Include all accounts if using multiple",
        ],
        minimum_amounts: {
          student: "£1,334/month for 9 months",
          skilled_worker: "£1,270 minimum",
          investor: "£2 million available funds",
        },
        tips: "Maintain consistent balance for 28+ days before application",
      },
      "employment letter": {
        purpose: "Confirms job offer or current employment",
        must_include: [
          "Company letterhead",
          "Job title and description",
          "Salary details",
          "Start date",
          "Sponsor license number (if applicable)",
          "Signed by authorized person",
        ],
        additional: "May need Certificate of Sponsorship (CoS) for UK",
        tips: "Ensure letter is dated within 30 days of application",
      },
      "medical examination": {
        purpose: "Health screening for visa",
        tests_included: [
          "Chest X-ray (TB screening)",
          "Blood tests",
          "Physical examination",
          "Vaccination records review",
        ],
        where: "Approved panel physicians only",
        cost: "£150-500 depending on tests",
        validity: "6 months typically",
        tips: "Book appointment early as slots fill quickly",
      },
      "academic transcripts": {
        purpose: "Verify educational qualifications",
        requirements: [
          "Official sealed transcripts",
          "Degree certificates",
          "English translations if needed",
          "NARIC/ENIC assessment for equivalency",
        ],
        authentication: "May need apostille or attestation",
        tips: "Order extra copies as originals may be retained",
      },
    };

    const doc = documentGuides[documentType.toLowerCase()] || {
      purpose: "Supporting document for visa application",
      requirements: ["Contact embassy for specific requirements"],
      tips: "Ensure all documents are current and properly certified",
    };

    let response = `**${documentType.toUpperCase()} for ${country}**\n\n`;
    response += `**Purpose:** ${doc.purpose}\n\n`;

    if (doc.where) {
      response += `**Where to obtain:** ${doc.where}\n\n`;
    }

    if (doc.process) {
      response += `**Process:**\n${doc.process.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}\n\n`;
    }

    if (doc.requirements) {
      response += `**Requirements:**\n- ${doc.requirements.join('\n- ')}\n\n`;
    }

    if (doc.must_include) {
      response += `**Must include:**\n- ${doc.must_include.join('\n- ')}\n\n`;
    }

    if (doc.minimum_amounts) {
      response += `**Minimum amounts by visa type:**\n`;
      for (const [visa, amount] of Object.entries(doc.minimum_amounts)) {
        response += `- ${visa}: ${amount}\n`;
      }
      response += '\n';
    }

    if (doc.validity) {
      response += `**Validity:** ${doc.validity}\n\n`;
    }

    if (doc.cost) {
      response += `**Cost:** ${doc.cost}\n\n`;
    }

    response += `**💡 Pro tip:** ${doc.tips}`;

    return response;
  },
});