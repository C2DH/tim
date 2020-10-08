/* eslint no-unused-expressions: 0 */
import Prism from 'prismjs';
import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { connect } from 'react-redux';
import timecode from 'smpte-timecode';

import isHotkey from 'is-hotkey';
import { Slate, Editable, withReact } from 'slate-react';
import { Editor, Node, Text, Range, createEditor } from 'slate';
import { withHistory } from 'slate-history';

import { Flex, View, Content, ActionGroup, Item } from '@adobe/react-spectrum';

import { update, set } from '../../reducers/data';
import Leaf from './Leaf';
import Toolbar from './Toolbar';

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
    timecode: {
      pattern: /\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\](?=\s*\w)/,
      lookbehind: !0,
      // inside: { punctuation: /^[*_]|[*_]$/ },
      // alias: "timecode"
    },
    timecodeL: {
      pattern: /(?<!^)\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\](?=$)/,
      lookbehind: !0,
      // inside: { punctuation: /^[*_]|[*_]$/ },
      // alias: "timecode"
    },
    timecode3: {
      pattern: /^\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\](?=\s*$)/,
      lookbehind: !0,
      // inside: { punctuation: /^[*_]|[*_]$/ },
      // alias: "timecode"
    },
    timecode2: {
      pattern: /(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/,
      lookbehind: !0,
      // inside: { punctuation: /^[*_]|[*_]$/ },
    },
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
};

const progressState = atom({
  key: 'progressState',
  default: 0,
});

const titleState = atom({
  key: 'titleState',
  default: false,
});

const synopsisState = atom({
  key: 'synopsisState',
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

const Notes = ({ data: { items }, update, set, player }) => {
  const { id } = useParams();
  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);
  const { notes } = item ?? {};

  const progress = useRecoilValue(progressState);
  const [, setIsTitle] = useRecoilState(titleState);
  const [, setIsSynopsis] = useRecoilState(synopsisState);

  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // debug
  window.editor = editor;
  window.Editor = Editor;

  const seekTo = useCallback(time => player.current?.seekTo(time, 'seconds'), [player]);

  const handleClick = useCallback(
    event => {
      const target = event.nativeEvent.srcElement;
      if (target.nodeName === 'SPAN') {
        const text = target.innerText.replace(/\[|\]/g, '').trim();
        let tc = null;

        try {
          tc = timecode(`${text}:00`, 1e3);
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
      //   // ...
      // }

      set([id, 'notes', notes]);
    },
    [id, set, editor, setIsTitle, setIsSynopsis]
  );

  const onKeyDown = useCallback(
    event => {
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault();

          const mark = HOTKEYS[hotkey];

          if (mark.startsWith('time')) {
            const tokens = [];

            mark === 'times' &&
              [3, 2, 1]
                .filter(delta => progress >= delta)
                .forEach(delta => {
                  const tc = timecode((progress - delta) * 1e3, 1e3);
                  const [hh, mm, ss, mmm] = tc.toString().split(':');
                  tokens.push(`[${hh}:${mm}:${ss}]`);
                });

            const tc = timecode(progress * 1e3, 1e3);
            const [hh, mm, ss, mmm] = tc.toString().split(':');
            tokens.push(`[${hh}:${mm}:${ss}]`);

            editor.insertText(tokens.join(' '));
          }
        }
      }
    },
    [editor, progress]
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

  return (
    <Flex direction="row" gap="size-100">
      <View flex UNSAFE_style={{ overflowY: 'scroll' }}>
        <Content margin="size-100">
          <div onClick={handleClick}>
            <Slate editor={editor} value={notes} onChange={handleChange}>
              <Editable autoFocus placeholder="Write some markdown…" {...{ decorate, renderLeaf, onKeyDown }} />
            </Slate>
          </div>
        </Content>
      </View>
      <View margin="size-100">
        <Toolbar />
      </View>
    </Flex>
  );
};

export default connect(({ data }) => ({ data }), { update, set })(Notes);
