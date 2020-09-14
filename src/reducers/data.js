import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  editor: [
    {
      children: [{ text: '# Title' }],
    },
    {
      children: [{ text: '## Synopsis?' }],
    },
    {
      children: [
        {
          text: 'Timecodes just text 00:02:34 with brackets in the middle [00:02:34] of text',
        },
      ],
    },
    {
      children: [
        {
          text: '[00:02:34] at beginning',
        },
      ],
    },
    {
      children: [
        {
          text: 'at the end [00:02:34]',
        },
      ],
    },
    {
      children: [
        {
          text: 'alone on its line as delimiter:',
        },
      ],
    },
    {
      children: [
        {
          text: '[00:02:34]',
        },
      ],
    },
    {
      children: [
        {
          text: '---',
        },
      ],
    },
    {
      children: [
        {
          text: 'Markdown: **bold** and _italic_ and `code`',
        },
      ],
    },
    {
      children: [
        {
          text: '> quote [00:02:34]',
        },
      ],
    },
    {
      children: [
        {
          text: 'List\n* one 00:02:34\n* two\n* four\n* three',
        },
      ],
    },
  ],
};

const dataSlice = createSlice({
  name: 'data',
  initialState,

  reducers: {
    update: (state, { payload }) => ({ ...state, ...payload }),
    reset: () => initialState,
  },
});

const { actions, reducer } = dataSlice;
export const { update, reset } = actions;
export default reducer;
