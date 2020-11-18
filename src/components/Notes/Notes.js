/* eslint-disable no-unused-vars */
/* eslint no-unused-expressions: 0 */
/* eslint no-sequences: 0 */
import Prism from 'prismjs';
import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { connect } from 'react-redux';
import timecode from 'smpte-timecode';
import { Redirect } from 'react-router-dom';

import isHotkey from 'is-hotkey';
import { Slate, Editable, withReact } from 'slate-react';
import { Editor, Text, createEditor, Range } from 'slate';
import { withHistory } from 'slate-history';

import { Flex, View, Content, ActionGroup, Item, TooltipTrigger, Tooltip, Text as Label } from '@adobe/react-spectrum';
import Clock from '@spectrum-icons/workflow/Clock';

import { update, set, setNotes } from '../../reducers/data';
import Leaf from './Leaf';

import './Notes.css';

(Prism.languages.markdown = Prism.languages.extend('markup', {})),
  Prism.languages.insertBefore('markdown', 'prolog', {
    blockquote: { pattern: /^>(?:[\t ]*>)*/m, alias: 'punctuation' },
    code: [
      { pattern: /^(?: {4}|\t).+/m, alias: 'keyword' },
      { pattern: /``.+?``|`[^`\n]+`/, alias: 'keyword' },
    ],
    title: [
      // {
      //   pattern: /\w+.*(?:\r?\n|\r)(?:==+|--+)/,
      //   alias: 'important',
      //   inside: { punctuation: /==+$|--+$/ },
      // },
      {
        pattern: /(^\s*)#+.+/m,
        lookbehind: !0,
        alias: 'important',
        inside: { punctuation: /^#+|#+$/ },
      },
    ],
    hr: {
      pattern: /(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,
      lookbehind: !0,
      alias: 'punctuation',
    },
    list: {
      pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
      lookbehind: !0,
      alias: 'punctuation',
    },
    // 'url-reference': {
    //   pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
    //   inside: {
    //     variable: { pattern: /^(!?\[)[^\]]+/, lookbehind: !0 },
    //     string: /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
    //     punctuation: /^[\[\]!:]|[<>]/,
    //   },
    //   alias: 'url',
    // },
    bold: {
      pattern: /(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
      lookbehind: !0,
      inside: { punctuation: /^\*\*|^__|\*\*$|__$/ },
    },
    italic: {
      pattern: /(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,
      lookbehind: !0,
      inside: { punctuation: /^[*_]|[*_]$/ },
    },
    timecode: [
      {
        pattern: /\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\](?=\s+)/,
        alias: 'timecode',
      },
      {
        pattern: /\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\.(?:\d+)\](?=\s+)/,
        alias: 'timecode',
      },
      {
        pattern: /\[(?:\d):(?:[012345]\d):(?:[012345]\d)\](?=\s+)/,
        alias: 'timecode',
      },
      {
        pattern: /\[(?:[012345]\d):(?:[012345]\d)\](?=\s+)/,
        alias: 'timecode',
      },
      {
        pattern: /\[(?:\d):(?:[012345]\d)\](?=\s+)/,
        alias: 'timecode',
      },
      //
      {
        pattern: /(?!^)\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\.(?:\d+)\]/,
        alias: 'timecode',
      },
      {
        pattern: /(?!^)\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\]/,
        alias: 'timecode',
      },
      {
        pattern: /(?!^)\[(?:\d):(?:[012345]\d):(?:[012345]\d)\]/,
        alias: 'timecode',
      },
      {
        pattern: /(?!^)\[(?:[012345]\d):(?:[012345]\d)\]/,
        alias: 'timecode',
      },
      {
        pattern: /(?!^)\[(?:\d):(?:[012345]\d)\]/,
        alias: 'timecode',
      },
    ],
    // title
    timecoderow: [
      {
        pattern: /^\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\.(?:\d+)\]$/,
        alias: 'timecoderow',
      },
      {
        pattern: /^\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\]$/,
        alias: 'timecoderow',
      },
      {
        pattern: /^\[(?:\d):(?:[012345]\d):(?:[012345]\d)\]$/,
        alias: 'timecoderow',
      },
      {
        pattern: /^\[(?:[012345]\d):(?:[012345]\d)\]$/,
        alias: 'timecoderow',
      },
      {
        pattern: /^\[(?:\d):(?:[012345]\d)\]$/,
        alias: 'timecoderow',
      },
    ],
    // pink
    timecodesimple: [
      {
        pattern: /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/,
        alias: 'timecodesimple',
      },
      {
        pattern: /(?:\d):(?:[012345]\d):(?:[012345]\d)/,
        alias: 'timecodesimple',
      },
      {
        pattern: /(?:[012345]\d):(?:[012345]\d)/,
        alias: 'timecodesimple',
      },
      {
        pattern: /(?:\d):(?:[012345]\d)/,
        alias: 'timecodesimple',
      },
    ],
    url: {
      pattern: /!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
      inside: {
        variable: { pattern: /(!?\[)[^\]]+(?=\]$)/, lookbehind: !0 },
        string: { pattern: /"(?:\\.|[^"\\])*"(?=\)$)/ },
      },
    },
  }),
  (Prism.languages.markdown.bold.inside.url = Prism.util.clone(Prism.languages.markdown.url)),
  (Prism.languages.markdown.italic.inside.url = Prism.util.clone(Prism.languages.markdown.url)),
  (Prism.languages.markdown.bold.inside.italic = Prism.util.clone(Prism.languages.markdown.italic)),
  (Prism.languages.markdown.italic.inside.bold = Prism.util.clone(Prism.languages.markdown.bold));

const HOTKEYS = {
  'mod+j': 'time',
  'ctrl+j': 'time',
  'shift+mod+j': 'times',
  'shift+ctrl+j': 'times',
  esc: 'play-pause',
  'ctrl+[': 'rwd',
  'ctrl+]': 'ffw',
};

const progressState = atom({
  key: 'progressState',
  default: 0,
});

const playState = atom({
  key: 'playState',
  default: false,
});

const isTitleActive = editor => {
  const [title] = Editor.nodes(editor, {
    match: n => n.text && n.text.startsWith('#'),
  });

  return !!title;
};

const isSynopsisActive = editor => {
  const [synopsis] = Editor.nodes(editor, {
    match: n => n.text && n.text.startsWith('>'),
  });

  return !!synopsis;
};

const Notes = ({
  data: { items, timecodeInterval = 1, subSecond = false, skipIncrement = 1 },
  update,
  set,
  setNotes,
  player,
}) => {
  const { id } = useParams();
  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);
  const { notes } = item ?? {};

  const progress = useRecoilValue(progressState);
  const [isTitle, setIsTitle] = useState(false);
  const [isSynopsis, setIsSynopsis] = useState(false);
  const [playing, setPlaying] = useRecoilState(playState);

  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  window.editor = editor;

  const seekTo = useCallback(time => player.current?.seekTo(time, 'seconds'), [player]);
  const ffw = useCallback(() => player.current?.seekTo(progress + parseFloat(skipIncrement), 'seconds'), [
    player,
    progress,
    skipIncrement,
  ]);
  const rwd = useCallback(() => player.current?.seekTo(progress - parseFloat(skipIncrement), 'seconds'), [
    player,
    progress,
    skipIncrement,
  ]);

  const handleClick = useCallback(
    event => {
      const target = event.nativeEvent.srcElement;
      if (target.nodeName === 'SPAN') {
        const text = target.innerText.trim();
        const timecodes = [
          ...text.matchAll(new RegExp(/\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\]/g)),
          ...text.matchAll(new RegExp(/\[(?:\d):(?:[012345]\d):(?:[012345]\d)\]/g)),
          ...text.matchAll(new RegExp(/\[(?:[012345]\d):(?:[012345]\d)\]/g)),
          ...text.matchAll(new RegExp(/\[(?:\d):(?:[012345]\d)\]/g)),
          ...text.matchAll(new RegExp(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/g)),
          ...text.matchAll(new RegExp(/(?:\d):(?:[012345]\d):(?:[012345]\d)/g)),
          ...text.matchAll(new RegExp(/(?:[012345]\d):(?:[012345]\d)/g)),
          ...text.matchAll(new RegExp(/(?:\d):(?:[012345]\d)/g)),
        ];

        if (timecodes.length === 0) return;

        let [ss, mm, hh = '00'] = timecodes[0][0].replace(/\[|\]/g, '').split(':').reverse();
        if (hh.length === 1) hh = `0${hh}`;
        if (mm.length === 1) mm = `0${mm}`;

        let tc = null;
        try {
          tc = timecode(`${hh}:${mm}:${ss}:00`, 1e3);
        } catch (ignored) {}

        tc && seekTo(tc.frameCount / 1e3);
      }
    },
    [seekTo]
  );

  const handleChange = useCallback(
    notes => {
      setIsTitle(isTitleActive(editor));
      setIsSynopsis(isSynopsisActive(editor));

      // const { selection } = editor;
      // const [start, end] = Range.edges(selection);

      // console.log(selection, [start, end]);

      // if (Range.isCollapsed(selection)) {
      // }

      setNotes([id, notes]);
    },
    [id, setNotes, editor, setIsTitle, setIsSynopsis]
  );

  const onKeyDown = useCallback(
    event => {
      let once = false;
      for (const hotkey in HOTKEYS) {
        if (!once && isHotkey(hotkey, event)) {
          once = true;
          event.preventDefault();

          const mark = HOTKEYS[hotkey];

          if (mark.startsWith('time')) {
            const { selection } = editor;

            if (Range.isCollapsed(selection)) {
              const [
                {
                  offset,
                  path: [index],
                },
              ] = Range.edges(selection);

              const {
                children: [{ text }],
              } = notes[index];

              const token =
                text.substring(0, offset).split(' ').pop() + text.substring(offset).split(' ').reverse().pop();

              const matches = [
                ...token.matchAll(new RegExp(/\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\]/g)),
                ...token.matchAll(new RegExp(/\[(?:\d):(?:[012345]\d):(?:[012345]\d)\]/g)),
                ...token.matchAll(new RegExp(/\[(?:[012345]\d):(?:[012345]\d)\]/g)),
                ...token.matchAll(new RegExp(/\[(?:\d):(?:[012345]\d)\]/g)),
              ];

              if (matches.length > 0) {
                const notes2 = [...notes];

                notes2[index] = {
                  children: [
                    {
                      text: text.replace(token, token.replace(/\[|\]/g, '')),
                    },
                  ],
                };
                setNotes([id, notes2]);
                return;
              }

              const matches2 = [
                ...token.matchAll(new RegExp(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/g)),
                ...token.matchAll(new RegExp(/(?:\d):(?:[012345]\d):(?:[012345]\d)/g)),
                ...token.matchAll(new RegExp(/(?:[012345]\d):(?:[012345]\d)/g)),
                ...token.matchAll(new RegExp(/(?:\d):(?:[012345]\d)/g)),
              ];

              if (matches2.length > 0) {
                const notes2 = [...notes];

                notes2[index] = {
                  children: [
                    {
                      text: text.replace(token, `[${token}]`),
                    },
                  ],
                };
                setNotes([id, notes2]);
                return;
              }
            }

            const tokens = [];

            mark === 'times' &&
              [3, 2, 1]
                .filter(delta => progress >= delta * parseFloat(timecodeInterval))
                .forEach(delta => {
                  const tc = timecode((progress - delta * parseFloat(timecodeInterval)) * 1e3, 1e3);
                  const [hh, mm, ss, mmm] = tc.toString().split(':');
                  tokens.push(subSecond ? `[${hh}:${mm}:${ss}.${mmm}]` : `[${hh}:${mm}:${ss}]`);
                });

            const tc = timecode(progress * 1e3, 1e3);
            let [hh, mm, ss, mmm] = tc.toString().split(':');

            mmm = `${mmm}`;
            if (mmm.length === 1) mmm = `00${mmm}`;
            if (mmm.length === 2) mmm = `0${mmm}`;

            tokens.push(subSecond ? `[${hh}:${mm}:${ss}.${mmm}]` : `[${hh}:${mm}:${ss}]`);

            editor.insertText(tokens.join(' '));
          }

          if (mark === 'play-pause') setPlaying(!playing);
          if (mark === 'rwd') rwd();
          if (mark === 'ffw') ffw();
        }
      }
    },
    [editor, progress, timecodeInterval, subSecond, setPlaying, playing, ffw, rwd, notes, setNotes, id]
  );

  const decorate = useCallback(([node, path]) => {
    const ranges = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const getLength = token => {
      if (typeof token === 'string') {
        return token.length;
      } else if (typeof token.content === 'string') {
        return token.content.length;
      } else {
        return token.content.reduce((l, t) => l + getLength(t), 0);
      }
    };

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;

    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;

      if (typeof token !== 'string') {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }

      start = end;
    }

    return ranges;
  }, []);

  // const selected = useMemo(() => [...new Set([isTitle ? '.$title' : null, isSynopsis ? '.$synopsis' : null])], [
  //   isTitle,
  //   isSynopsis,
  // ]);

  // const setAction = useCallback(action => {
  //   console.log(action);
  //   switch (action) {
  //     case 'foo':
  //       // setTranscriptVisible(!transcriptVisible);
  //       break;
  //     default:
  //       console.warn('unhandled action', action);
  //   }
  // }, []);

  return notes ? (
    <Flex direction="row" gap="size-100" height="100%">
      <View flex UNSAFE_style={{ overflowY: 'scroll' }}>
        <Content margin="size-200">
          <div onClick={handleClick}>
            <Slate editor={editor} value={notes} onChange={handleChange}>
              <Editable autoFocus placeholder="Write some markdown…" {...{ decorate, renderLeaf, onKeyDown }} />
            </Slate>
          </div>
        </Content>
      </View>
      {/*<View margin="size-100">
        <ActionGroup orientation="vertical" selectionMode="multiple" selectedKeys={selected} onAction={setAction}>
          <TooltipTrigger delay={0} placement="left">
            <Item key="timecode" aria-label="Timecode">
              <Clock />
            </Item>
            <Tooltip>Timecode</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0} placement="left">
            <Item key="title" aria-label="Title">
              <Label>T</Label>
            </Item>
            <Tooltip>Title</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0} placement="left">
            <Item key="synopsis" aria-label="Synopsis">
              <Label>S</Label>
            </Item>
            <Tooltip>Synopsis</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger delay={0} placement="left">
            <Item key="keyword" aria-label="Keyword">
              <Label>K</Label>
            </Item>
            <Tooltip>Keyword</Tooltip>
          </TooltipTrigger>
        </ActionGroup>
  </View>*/}
    </Flex>
  ) : (
    <Redirect to="/new" />
  );
};

export default connect(({ data }) => ({ data }), { update, set, setNotes })(Notes);
