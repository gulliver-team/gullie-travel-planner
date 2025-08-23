import React from 'react';
import { VapiButton } from './VapiButton';

export const VapiExample: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Vapi Voice Assistant Example</h2>
      <p>Click the button below to start a voice conversation:</p>
      
      <VapiButton />
      
      <div style={{ marginTop: '20px' }}>
        <h3>How it works:</h3>
        <ol>
          <li>Make sure you have set up your environment variables</li>
          <li>Click &quot;Start Call&quot; to begin the conversation</li>
          <li>Speak naturally with the assistant</li>
          <li>Click &quot;End Call&quot; when finished</li>
        </ol>
      </div>
    </div>
  );
};
