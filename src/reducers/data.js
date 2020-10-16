import { createSlice } from '@reduxjs/toolkit';
import timecode from 'smpte-timecode';

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

const string2tc = text => {
  let [ss, mm, hh = '00'] = text.replace(/\[|\]/g, '').split(':').reverse();
  if (hh.length === 1) hh = `0${hh}`;
  if (mm.length === 1) mm = `0${mm}`;

  let tc = null;
  try {
    tc = timecode(`${hh}:${mm}:${ss}:00`, 1e3);
  } catch (ignored) {}

  return tc;
};

const tc2time = tc => tc.frameCount / 1e3;

const tc2string = tc => tc.toString().split(':').slice(0, 3).join(':');

const notes2metadata = notes => {
  const lines = notes.map(({ children }) => children.map(({ text }, index) => text).join('\n'));
  const sections = lines
    .reduce((acc, line, index) => {
      let matches = [
        ...line.matchAll(new RegExp(/^\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\]$/g)),
        ...line.matchAll(new RegExp(/^\[(?:\d):(?:[012345]\d):(?:[012345]\d)\]$/g)),
        ...line.matchAll(new RegExp(/^\[(?:[012345]\d):(?:[012345]\d)\]$/g)),
        ...line.matchAll(new RegExp(/^\[(?:\d):(?:[012345]\d)\]$/g)),
      ];

      if (index === 0 && matches.length === 0) matches = [['[00:00:00]']];

      if (matches.length > 0) {
        const tc = string2tc(matches[0][0]);

        return [
          ...acc,
          {
            index,
            timecode: tc2string(tc),
            time: tc2time(tc),
            line,
            lines: [],
            matches,
          },
        ];
      }

      matches = [
        ...line.matchAll(new RegExp(/\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\](?=\s+)/g)),
        ...line.matchAll(new RegExp(/\[(?:\d):(?:[012345]\d):(?:[012345]\d)\](?=\s+)/g)),
        ...line.matchAll(new RegExp(/\[(?:[012345]\d):(?:[012345]\d)\](?=\s+)/g)),
        ...line.matchAll(new RegExp(/\[(?:\d):(?:[012345]\d)\](?=\s+)/g)),
        ...line.matchAll(new RegExp(/(?!^)\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\]/g)),
        ...line.matchAll(new RegExp(/(?!^)\[(?:\d):(?:[012345]\d):(?:[012345]\d)\]/g)),
        ...line.matchAll(new RegExp(/(?!^)\[(?:[012345]\d):(?:[012345]\d)\]/g)),
        ...line.matchAll(new RegExp(/(?!^)\[(?:\d):(?:[012345]\d)\]/g)),
      ];

      const timecodes = matches.map(([text]) => string2tc(text));

      const prev = acc.pop();
      prev.lines.push({
        index,
        line,
        empty: line === '',
        timecodes: timecodes.map(tc => tc2string(tc)),
        times: timecodes.map(tc => tc2time(tc)),
        matches,
        keywords: [...line.matchAll(/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/g)],
      });

      return [...acc, prev];
    }, [])
    .map(section => {
      const title = section.lines.find(({ line }) => line.match(/(^\s*)#+.+/m));
      const synopsis = section.lines.filter(({ line }) => line.match(/^>(?:[\t ]*>)*/m));

      const nonNotes = [title?.index, ...synopsis.map(({ index }) => index)];
      const notes = section.lines.filter(({ index }) => !nonNotes.includes(index));

      return {
        ...section,
        title,
        synopsis,
        notes,
        keywords: section.lines.flatMap(({ keywords }) => keywords),
      };
    });

  console.log({ sections });

  return sections;
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
    setNotes: (state, { payload: [id, notes] }) => {
      const index = state.items.findIndex(({ id: id_ }) => id_ === id);
      state.items[index].notes = notes;
      state.items[index].metadata = notes2metadata(notes);
      state.items[index].updated = Date.now();

      return state;
    },
    add: (state, { payload }) => {
      const index = state.items.findIndex(({ id }) => id === payload.id);
      if (index > 0) state.items.splice(index, 1);
      state.items.push(payload);
      return state;
    },
    reset: () => initialState,
  },
});

const { actions, reducer } = dataSlice;
export const { update, set, setNotes, add, reset } = actions;
export default reducer;
