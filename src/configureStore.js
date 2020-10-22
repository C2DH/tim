import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
// import RavenMiddleware from 'redux-raven-middleware';
import { createLogger } from 'redux-logger';
import { save, load } from 'redux-localstorage-simple';

import rootReducer from './reducers';

// const SENTRY_DSN = null;

if (localStorage.getItem('TIM-06_data')) localStorage.clear();

const logger = createLogger({
  predicate: (state, action) => !['update', 'timeupdate'].includes(action.type),
  duration: true,
  collapsed: true,
  diff: true,
});

export const configureAppStore = preloadedState => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: [
      // RavenMiddleware(SENTRY_DSN),
      logger,
      save({
        namespace: 'TIM-07',
        states: ['data'],
        debounce: 1000,
      }),
      ...getDefaultMiddleware(),
    ],
    // preloadedState,
    preloadedState: load({
      namespace: 'TIM-07',
      states: ['data'],
      preloadedState,
    }),
    devTools:
      process.env.NODE_ENV !== 'production'
        ? {
            trace: true,
          }
        : false,
  });

  // if (process.env.NODE_ENV !== 'production' && module.hot) {
  //   module.hot.accept('@reducers', () => store.replaceReducer(rootReducer));
  // }

  return store;
};
