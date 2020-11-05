import React, { useMemo } from 'react';

const flags = [
  'bold',
  'italic',
  'underlined',
  'title',
  'list',
  'hr',
  'blockquote',
  'code',
  'timecode',
  'timecodesimple',
  'timecoderow',
];

const Leaf = ({ attributes, children, leaf }) => {
  const classNames = useMemo(() => flags.filter(flag => !!leaf[flag]).join(' '), [leaf]);

  // if (
  //   (leaf.timecoderow || leaf.timecode) &&
  //   leaf.text.match(/\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\.(?:\d+)\]/)
  // ) {
  //   const [hh, mm, s] = leaf.text.replace(/\[|\]/g, '').split(':');
  //   const [ss, mmm] = s.split('.');
  //   leaf.text = `[${hh}:${mm}:${ss}]`;
  // }

  return (
    <span {...attributes} className={`leaf ${classNames}`}>
      {children}
    </span>
  );
};

export default Leaf;
