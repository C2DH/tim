import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import { HashRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Provider as SpectrumProvider, defaultTheme } from '@adobe/react-spectrum';

import App from './App';
import { configureAppStore } from './configureStore';
import * as serviceWorker from './serviceWorker';

import './index.css';

const store = configureAppStore({});

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <Provider store={store}>
        <SpectrumProvider theme={defaultTheme} colorScheme="light">
          <Router>
            <App />
          </Router>
        </SpectrumProvider>
      </Provider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
