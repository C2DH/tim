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
  const segments = lines
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
            // line,
            lines: [],
            // matches,
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
    .map((segment, index) => {
      const title = segment.lines.find(({ line }) => line.match(/(^\s*)#+.+/m));
      const synopsis = segment.lines.filter(({ line }) => line.match(/^>(?:[\t ]*>)*/m));

      const nonNotes = [title?.index, ...synopsis.map(({ index }) => index)];
      const notes = segment.lines.filter(({ index }) => !nonNotes.includes(index));

      return {
        ...segment,
        timecodes: [
          ...segment.lines.flatMap(({ timecodes, times }) =>
            timecodes.map((timecode, index) => ({ timecode, time: times[index] }))
          ),
        ],
        title: title ? title.line.replace(/#/g, '').trim() : `Segment ${index + 1}`,
        synopsis: synopsis
          ? synopsis
              .map(({ line }) => line.replace(/^>|\*\*/g, '').trim())
              .join('\n')
              .replace(/\n\n+/g, '\n\n')
              .trim()
          : '',
        notes: notes
          ? notes
              .map(({ line }) => line.replace(/^>|\*\*/g, '').trim())
              .join('\n')
              .replace(/\n\n+/g, '\n\n')
              .trim()
          : '',
        keywords: [
          ...new Set(
            segment.lines
              .flatMap(({ keywords }) => keywords)
              .map(([keyword]) => keyword.trim())
              .join(',')
              .replace(/\*/g, '')
              .split(',')
              .map(k => k.trim())
          ),
        ].join(', '),
      };
    });

  console.log({ segments });

  return segments;
};

const metadata2notes = metadata =>
  metadata
    .sort(({ time: a }, { time: b }) => a - b)
    .map(({ timecode, title, synopsis, notes, keywords }) => {
      const lines = [
        `[${timecode}]`,
        `# ${title.trim()}`,
        synopsis
          .trim()
          .split('\n')
          .map(line => `> ${line}`)
          .join('\n'),
        notes
          .trim()
          .split('\n')
          .map(line => line)
          .join('\n'),
        keywords ? `**${keywords.trim()}**` : '',
      ];

      return lines.join('\n\n');
    })
    .join('\n')
    .split('\n')
    .map(text => ({
      children: [{ text }],
    }));

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
    setMetadata: (state, { payload: [id, index, key, value] }) => {
      const idx = state.items.findIndex(({ id: id_ }) => id_ === id);
      const idx2 = state.items[idx].metadata.findIndex(({ index: index_ }) => index_ === index);
      state.items[idx].metadata[idx2][key] = value;
      console.log(metadata2notes(state.items[idx].metadata));
      state.items[idx].notes = metadata2notes(state.items[idx].metadata);
      state.items[idx].updated = Date.now();
    },
    reset: () => initialState,
  },
});

const { actions, reducer } = dataSlice;
export const { update, set, setNotes, add, reset, setMetadata } = actions;
export default reducer;
