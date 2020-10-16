import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import Md from 'markdown-it';

import { Flex, View, Content, ActionGroup, Item } from '@adobe/react-spectrum';

import { update } from '../../reducers/data';

import './Metadata.css';

const Segments = ({ segments }) => {
  return (
    <div>
      {segments.map(({ title, time, timecode, lines, synopsis, notes, keywords }, index) => (
        <div className="segment" key={`${index}-${time}`} data-time={time} data-timecode={timecode}>
          <h4>
            {timecode} {title ? title.line : `Segment ${index + 1}`}
          </h4>
          <h6>Notes</h6>
          <pre>{notes.map(({ line }) => line).join('\n')}</pre>
          <h6>Synopsis</h6>
          <pre>{synopsis.map(({ line }) => line).join('\n')}</pre>
          <h6>Keywords</h6>
          <pre>{keywords.map(([keyword]) => keyword).join(' ')}</pre>
          <h6>Raw content</h6>
          <pre>{lines.map(({ line }) => line).join('\n')}</pre>
        </div>
      ))}
    </div>
  );
};

const Metadata = ({ data, update }) => {
  const { items } = data;
  const { id } = useParams();
  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);

  const { metadata = [] } = item ?? {};

  // const text = item.notes.map(({ children }) => children.map(({ text }) => text).join('\n')).join('\n');
  // const md = new Md();
  // const parsed = md.parse(text, {});

  return (
    <View flex UNSAFE_style={{ overflowY: 'scroll' }}>
      <Content margin="size-100">
        <Segments segments={metadata} />
      </Content>
    </View>
  );
};

export default connect(({ data }) => ({ data }), { update })(Metadata);
