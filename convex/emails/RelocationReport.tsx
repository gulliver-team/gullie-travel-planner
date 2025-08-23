import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Preview,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components';

interface RelocationReportProps {
  name: string;
  email: string;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  visaOptions: string;
}

export function RelocationReport({
  name = 'Valued Client',
  email,
  originCity,
  originCountry,
  destinationCity,
  destinationCountry,
  visaOptions = '',
}: RelocationReportProps) {
  const previewText = `Your relocation report from ${originCity} to ${destinationCity}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={header}>
            <Heading as="h1" style={headerTitle}>
              Your Relocation Report
            </Heading>
            <Text style={headerSubtitle}>
              From {originCity}, {originCountry} to {destinationCity}, {destinationCountry}
            </Text>
          </Section>

          {/* Greeting */}
          <Section style={content}>
            <Text style={greeting}>Dear {name},</Text>
            <Text style={paragraph}>
              Thank you for using Gullie for your relocation planning. Based on our analysis, 
              here's your comprehensive relocation report.
            </Text>
          </Section>

          {/* Visa Options */}
          <Section style={sectionContainer}>
            <Heading as="h2" style={sectionTitle}>
              📋 Visa Options Summary
            </Heading>
            <div style={sectionContent}>
              {formatVisaOptions(visaOptions)}
            </div>
          </Section>

          {/* Timeline */}
          <Section style={sectionContainer}>
            <Heading as="h2" style={sectionTitle}>
              📅 Recommended Timeline
            </Heading>
            <div style={sectionContent}>
              <Text style={listItem}><strong>Month 1:</strong> Research and document gathering</Text>
              <Text style={listItem}><strong>Month 2:</strong> Visa application submission</Text>
              <Text style={listItem}><strong>Month 3:</strong> Housing arrangements and travel booking</Text>
              <Text style={listItem}><strong>Month 4:</strong> Final preparations and relocation</Text>
            </div>
          </Section>

          {/* Document Checklist */}
          <Section style={sectionContainer}>
            <Heading as="h2" style={sectionTitle}>
              📄 Document Checklist
            </Heading>
            <div style={sectionContent}>
              <Text style={listItem}>• Valid passport (6+ months validity)</Text>
              <Text style={listItem}>• Visa application forms</Text>
              <Text style={listItem}>• Proof of funds/bank statements</Text>
              <Text style={listItem}>• Employment letter/contract</Text>
              <Text style={listItem}>• Housing proof/rental agreement</Text>
              <Text style={listItem}>• Health insurance documentation</Text>
              <Text style={listItem}>• Educational certificates (if applicable)</Text>
              <Text style={listItem}>• Criminal background check</Text>
            </div>
          </Section>

          {/* Next Steps */}
          <Section style={sectionContainer}>
            <Heading as="h2" style={sectionTitle}>
              💡 Next Steps
            </Heading>
            <div style={sectionContent}>
              <Text style={listItem}>1. <strong>Choose your visa type</strong> based on your circumstances and timeline</Text>
              <Text style={listItem}>2. <strong>Gather all required documents</strong> from the checklist above</Text>
              <Text style={listItem}>3. <strong>Book visa appointment</strong> at the nearest consulate/embassy</Text>
              <Text style={listItem}>4. <strong>Arrange housing</strong> in {destinationCity}</Text>
              <Text style={listItem}>5. <strong>Book flights</strong> once visa is approved</Text>
            </div>
          </Section>

          {/* Resources */}
          <Section style={sectionContainer}>
            <Heading as="h2" style={sectionTitle}>
              🔗 Helpful Resources
            </Heading>
            <div style={sectionContent}>
              <Text style={listItem}>• Official Immigration Website for {destinationCountry}</Text>
              <Text style={listItem}>• Embassy/Consulate contact information</Text>
              <Text style={listItem}>• Local expat communities and forums</Text>
              <Text style={listItem}>• Housing platforms for {destinationCity}</Text>
            </div>
          </Section>

          <Hr style={divider} />

          {/* CTA Section */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              <strong>Need more help?</strong> Reply to this email or call us directly through our AI assistant for personalized guidance.
            </Text>
            <Button
              href="https://gullie.ai"
              style={button}
            >
              Contact Our AI Assistant
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Best regards,<br />
              The Gullie Team
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerCopyright}>
              © 2024 Gullie Travel Planner. All rights reserved.
            </Text>
            <Text style={footerCopyright}>
              This report was generated on {new Date().toLocaleDateString()}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function formatVisaOptions(visaOptions: string): React.ReactNode {
  if (!visaOptions) {
    return <Text style={paragraph}>Detailed visa information will be provided based on your specific situation.</Text>;
  }

  // Convert markdown-style formatting to React elements
  const lines = visaOptions.split('\n');
  return lines.map((line, index) => {
    // Handle bold text
    const formattedLine = line.replace(/\*\*(.*?)\*\*/g, (_, text) => text);
    
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return <Text key={index} style={listItem}>• {formattedLine.substring(2)}</Text>;
    }
    
    if (/^\d+\. /.test(line)) {
      return <Text key={index} style={listItem}>{formattedLine}</Text>;
    }
    
    return <Text key={index} style={paragraph}>{formattedLine}</Text>;
  });
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '40px 32px',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const headerSubtitle = {
  color: '#ffffff',
  fontSize: '18px',
  margin: '0',
  opacity: '0.9',
};

const content = {
  padding: '32px',
};

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  marginBottom: '8px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#404040',
  marginBottom: '16px',
};

const sectionContainer = {
  padding: '0 32px 32px',
};

const sectionTitle = {
  color: '#667eea',
  fontSize: '22px',
  fontWeight: '600',
  borderLeft: '4px solid #667eea',
  paddingLeft: '16px',
  marginBottom: '16px',
};

const sectionContent = {
  paddingLeft: '20px',
};

const listItem = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#404040',
  marginBottom: '8px',
};

const divider = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const ctaSection = {
  padding: '32px',
  textAlign: 'center' as const,
};

const ctaText = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#404040',
  marginBottom: '24px',
};

const button = {
  backgroundColor: '#667eea',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'inline-block',
};

const footer = {
  padding: '32px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#404040',
  marginBottom: '16px',
};

const footerDivider = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

const footerCopyright = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#8898aa',
  margin: '4px 0',
};

export default RelocationReport;