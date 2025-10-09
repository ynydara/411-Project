import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MantineProvider } from '@mantine/core';
import { Auth0Provider } from '@auth0/auth0-react';
import {parse as yamlParse} from "yaml";
import config from './env.json';



const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const domain = config.REACT_APP_AUTH0_DOMAIN;
const clientId = config.REACT_APP_AUTH0_CLIENT_ID;

if(!domain || !clientId){
    throw new Error("Missing Auth0 env variables");
}


root.render(
      <React.StrictMode>
        <MantineProvider>
            <Auth0Provider
                domain= {domain}
                // clientId="xs6IRfRrY1fMAtazbGF5uA25lWsAIbDs"
                clientId={clientId}
                authorizationParams={{
                    redirect_uri: window.location.origin,
                }}
            >
                <App />
            </Auth0Provider>
        </MantineProvider>
      </React.StrictMode>

);








// const auth0DOMAIN =

// const domain = config.authDomain;
// const clientId = config.apiKey;
// const auth0CLIENTID = process.env.REACT_APP_AUTH0_CLIENT_ID;



// root.render(
//       <React.StrictMode>
//         <MantineProvider>
//             <Auth0Provider
//                 domain= {auth0DOMAIN}
//                 // clientId="xs6IRfRrY1fMAtazbGF5uA25lWsAIbDs"
//                 clientId={auth0CLIENTID}
//                 authorizationParams={{
//                     redirect_uri: window.location.origin,
//                 }}
//             >
//                 <App />
//             </Auth0Provider>
//         </MantineProvider>
//       </React.StrictMode>
//
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals(console.log);
