import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/Router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';

const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_ID = (rawClientId && rawClientId.trim() !== '' && rawClientId !== 'your-google-client-id-here.apps.googleusercontent.com')
  ? rawClientId
  : '123456789-placeholder.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}

export default App;
