import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// AWS Amplify with Cognito
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

//import reportWebVitals from './reportWebVitals';

// AWS Amplify with Cognito
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: For performance monitoring --> reportWebVitals(console.log);
