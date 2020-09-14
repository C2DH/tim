import React, { useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import Md from 'markdown-it';

import { update } from '../reducers/data';

// import './Metadata.css';

const Metadata = ({ data, update }) => {
  const text = data.editor.map(({ children }) => children.map(({ text }) => text).join('\n')).join('\n');
  const md = new Md();
  const parsed = md.parse(text, {});

  return (
    <div>
      <pre>{JSON.stringify(parsed, null, 2)}</pre>
    </div>
  );
};

export default connect(({ data }) => ({ data }), { update })(Metadata);
