import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const getVisaRequirements = internalMutation({
  args: {
    originCountry: v.string(),
    destinationCountry: v.string(),
    visaType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { originCountry, destinationCountry, visaType } = args;

    // TODO: Integrate with Exa API for real-time visa requirements
    // For now, return comprehensive mock data

    if (!visaType) {
      // Return available visa types
      const visaOptions = {
        "Working Holiday": {
          age: "18-30 years",
          duration: "Up to 2 years",
          work: "Allowed",
          cost: "£295",
          processing: "3-4 weeks",
        },
        "Skilled Worker": {
          requirement: "Job offer required",
          duration: "Up to 5 years",
          path_to_residency: "Yes",
          cost: "£1,235",
          processing: "3-8 weeks",
        },
        "Student": {
          requirement: "University acceptance",
          duration: "Course length + 4 months",
          work: "20 hours/week",
          cost: "£490",
          processing: "3 weeks",
        },
        "Investor": {
          investment: "£2 million minimum",
          duration: "3 years + 4 months",
          path_to_residency: "Fast track available",
          cost: "£3,250",
          processing: "3-8 weeks",
        },
      };

      return `As a ${originCountry} citizen moving to ${destinationCountry}, you have several visa options:

${Object.entries(visaOptions).map(([type, details]) => 
  `**${type} Visa**:\n` +
  Object.entries(details).map(([key, value]) => 
    `  - ${key.replace(/_/g, ' ')}: ${value}`
  ).join('\n')
).join('\n\n')}

You have visa options like Working Holiday, Skilled Worker, Student, and Investor as a ${originCountry} citizen. Would you like me to explain more details or send you the related requirements in email as a PDF?`;
    }

    // Detailed requirements for specific visa type
    const requirements = {
      documents: [
        "Valid passport (6+ months validity)",
        "Proof of funds (bank statements)",
        "Police clearance certificate",
        "Medical examination results",
        "Biometric information",
        "Employment/sponsor documents",
        "Accommodation proof",
      ],
      process: [
        "1. Gather all required documents",
        "2. Complete online application",
        "3. Pay visa fees",
        "4. Book biometric appointment",
        "5. Attend visa interview (if required)",
        "6. Wait for decision",
        "7. Receive visa decision",
      ],
      timeline: "3-8 weeks typically",
      costs: {
        application: "£1,235",
        health_surcharge: "£624/year",
        biometric: "£19.20",
        priority_service: "£500 (optional)",
      },
    };

    return `For the ${visaType} visa from ${originCountry} to ${destinationCountry}:

**Required Documents:**
${requirements.documents.join('\n- ')}

**Application Process:**
${requirements.process.join('\n')}

**Timeline:** ${requirements.timeline}

**Costs Breakdown:**
- Application fee: ${requirements.costs.application}
- Health surcharge: ${requirements.costs.health_surcharge}
- Biometric fee: ${requirements.costs.biometric}
- Priority service: ${requirements.costs.priority_service}

Would you like me to explain any specific document requirements in more detail?`;
  },
});