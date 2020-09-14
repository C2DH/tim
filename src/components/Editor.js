/* eslint no-unused-expressions: 0 */
import Prism from 'prismjs';
import React, { useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { Slate, Editable, withReact } from 'slate-react';
import { Node, Text, createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { css } from 'emotion';

import { update } from '../reducers/data';

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

const Editor = ({ data, update }) => {
  console.log({ data });
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
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
    <div onClick={e => console.log(e.nativeEvent)}>
      <Slate editor={editor} value={data.editor} onChange={value => update({ editor: value })}>
        <Editable decorate={decorate} renderLeaf={renderLeaf} placeholder="Write some markdown..." />
      </Slate>
    </div>
  );
};

const Leaf = ({ attributes, children, leaf }) => {
  return (
    <span
      {...attributes}
      className={css`
        font-weight: ${leaf.bold && 'bold'};
        font-style: ${leaf.italic && 'italic'};
        text-decoration: ${leaf.underlined && 'underline'};
        ${leaf.title &&
        css`
          display: inline-block;
          font-weight: bold;
          font-size: 20px;
          margin: 20px 0 10px 0;
        `}
        ${leaf.list &&
        css`
          padding-left: 10px;
          font-size: 20px;
          line-height: 10px;
        `}
            ${leaf.hr &&
        css`
          display: block;
          text-align: center;
          border-bottom: 2px solid #ddd;
        `}
            ${leaf.blockquote &&
        css`
          display: inline-block;
          border-left: 2px solid #ddd;
          padding-left: 10px;
          color: #aaa;
          font-style: italic;
        `}
            ${leaf.code &&
        css`
          font-family: monospace;
          background-color: #eee;
          padding: 3px;
        `}
            ${leaf.timecode &&
        css`
          font-family: monospace;
          background-color: lightblue;
          padding: 3px;
        `}
        ${leaf.timecodeL &&
        css`
          font-family: monospace;
          background-color: lightblue;
          padding: 3px;
        `}
            ${leaf.timecode2 &&
        css`
          font-family: monospace;
          background-color: lightpink;
          padding: 3px;
        `}
          ${leaf.timecode3 &&
        css`
          font-family: monospace;
          background-color: red;
          display: inline-block;
          font-weight: bold;
          font-size: 20px;
          margin: 20px 0 10px 0;
        `}
      `}
    >
      {children}
    </span>
  );
};

export default connect(({ data }) => ({ data }), { update })(Editor);
