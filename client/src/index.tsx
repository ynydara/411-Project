import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MantineProvider } from '@mantine/core';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
      <React.StrictMode>
        <MantineProvider>
            <Auth0Provider
                domain="dev-7j638k7cu07zi7xw.us.auth0.com"
                clientId="xs6IRfRrY1fMAtazbGF5uA25lWsAIbDs"
                authorizationParams={{
                    redirect_uri: window.location.origin,
                }}
            >
                <App />
            </Auth0Provider>
        </MantineProvider>
      </React.StrictMode>

); 

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals(console.log);
