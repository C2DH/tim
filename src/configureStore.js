import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { save, load } from 'redux-localstorage-simple';

import rootReducer from './reducers';

export const namespace = 'TIM-07';

if (!localStorage.getItem(`${namespace}_data`) || localStorage.getItem(`${namespace}_data`) === 'undefined') {
  localStorage.setItem(`${namespace}_data`, '{"items":[]}');
  console.log(localStorage.getItem(`${namespace}_data`));
}

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
      logger,
      save({
        namespace,
        states: ['data'],
        debounce: 1000,
      }),
      ...getDefaultMiddleware(),
    ],
    preloadedState: load({
      namespace,
      states: ['data'],
      preloadedState,
      disableWarnings: false,
    }),
    devTools:
      process.env.NODE_ENV !== 'production'
        ? {
            trace: true,
          }
        : false,
  });

  return store;
};
