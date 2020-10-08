import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [
    {
      id: 'test',
      title: 'TEST',
      url: null,
      notes: [
        {
          children: [{ text: '[00:00:00]' }],
        },
      ],
      metadata: [],
      created: Date.now(),
      updated: Date.now(),
    },
    {
      id: 'test2',
      title: 'TEST test',
      url: null,
      notes: [
        {
          children: [{ text: '[00:00:00]' }],
        },
      ],
      metadata: [],
      created: Date.now(),
      updated: Date.now(),
    },
  ],
};

const dataSlice = createSlice({
  name: 'data',
  initialState,

  reducers: {
    update: (state, { payload }) => ({ ...state, ...payload }),
    set: (state, { payload: [id, key, value] }) => {
      const index = state.items.findIndex(({ id: id_ }) => id_ === id);
      state.items[index][key] = value;
      state.items[index].updated = Date.now();

      return state;
    },
    add: (state, { payload }) => {
      state.items.push(payload);
      return state;
    },
    reset: () => initialState,
  },
});

const { actions, reducer } = dataSlice;
export const { update, set, add, reset } = actions;
export default reducer;
