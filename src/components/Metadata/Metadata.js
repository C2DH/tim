import React, { useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Flex, View, Content, ActionGroup, Item, TextField, TextArea } from '@adobe/react-spectrum';

import { setMetadata } from '../../reducers/data';

import './Metadata.css';

const Segment = ({ title, time, timecode, synopsis, notes, keywords, index, id, setMetadata }) => {
  const setTitle = useCallback(title => setMetadata([id, index, 'title', title]), [id, index, setMetadata]);
  const setSynopsis = useCallback(synopsis => setMetadata([id, index, 'synopsis', synopsis]), [id, index, setMetadata]);
  const setNotes = useCallback(notes => setMetadata([id, index, 'notes', notes]), [id, index, setMetadata]);
  const setKeywords = useCallback(keywords => setMetadata([id, index, 'keywords', keywords]), [id, index, setMetadata]);

  return (
    <div className="segment" data-time={time} data-timecode={timecode}>
      <h4>{timecode}</h4>
      <TextField label="Title" value={title} width="100%" onChange={setTitle} />
      <TextArea label="Synopsis" value={synopsis} width="100%" onChange={setSynopsis} />
      <TextArea label="Notes" value={notes} width="100%" onChange={setNotes} />
      <TextField label="Keywords" value={keywords} width="100%" onChange={setKeywords} />
    </div>
  );
};

const Metadata = ({ data, setMetadata }) => {
  const { items } = data;
  const { id } = useParams();
  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);

  const { metadata = [] } = item ?? {};

  return (
    <View flex UNSAFE_style={{ overflowY: 'scroll' }}>
      <Content margin="size-100">
        {metadata.map((segment, index) => (
          <Segment key={`${index}-${segment.time}`} {...segment} setMetadata={setMetadata} id={id} />
        ))}
      </Content>
    </View>
  );
};

export default connect(({ data }) => ({ data }), { setMetadata })(Metadata);
