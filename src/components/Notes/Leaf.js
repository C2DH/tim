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

  return (
    <span {...attributes} className={`leaf ${classNames}`}>
      {children}
    </span>
  );
};

export default Leaf;
