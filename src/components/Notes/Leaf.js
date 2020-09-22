import React from 'react';
import { css } from 'emotion';

const Leaf = ({ attributes, children, leaf }) => {
  // console.log({ attributes, children, leaf });
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
          cursor: pointer;
        `}
        ${leaf.timecode &&
        css`
          font-family: monospace;
          background-color: lightblue;
          padding: 3px;
          cursor: pointer;
        `}
        ${leaf.timecodeL &&
        css`
          font-family: monospace;
          background-color: lightblue;
          padding: 3px;
          cursor: pointer;
        `}
        ${leaf.timecode2 &&
        css`
          font-family: monospace;
          background-color: lightpink;
          padding: 3px;
          cursor: pointer;
        `}
        ${leaf.timecode3 &&
        css`
          border-top: 2px solid #ddd;
          font-family: monospace;
          display: block;
          font-weight: bold;
          font-size: 20px;
          margin: 20px 0 10px 0;
          cursor: pointer;
        `}
      `}
    >
      {children}
    </span>
  );
};

export default Leaf;
