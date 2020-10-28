import React, { useMemo, useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Flex, View, Content, TextField, TextArea, ActionButton } from '@adobe/react-spectrum';
import TreeCollapse from '@spectrum-icons/workflow/TreeCollapse';
import TreeExpand from '@spectrum-icons/workflow/TreeExpand';

import TextareaAutosize from 'react-autosize-textarea';

import { setMetadata } from '../../reducers/data';

import './Metadata.css';

const Segment = ({ title, time, timecode, synopsis, notes, keywords, index, id, setMetadata }) => {
  const [collapsed, setCollapsed] = useState(false);

  const setTitle = useCallback(title => setMetadata([id, index, 'title', title]), [id, index, setMetadata]);
  const setSynopsis = useCallback(({ currentTarget: { value } }) => setMetadata([id, index, 'synopsis', value]), [
    id,
    index,
    setMetadata,
  ]);
  const setNotes = useCallback(({ currentTarget: { value } }) => setMetadata([id, index, 'notes', value]), [
    id,
    index,
    setMetadata,
  ]);
  const setKeywords = useCallback(keywords => setMetadata([id, index, 'keywords', keywords]), [id, index, setMetadata]);

  return (
    <div className="segment" data-time={time} data-timecode={timecode}>
      <h4>{timecode}</h4>
      <TextField label="Title" value={title} width="100%" onChange={setTitle} />
      <label>
        Synopsis
        <TextareaAutosize value={synopsis} onChange={setSynopsis} />
      </label>
      <label>
        <span onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <TreeExpand size="XS" /> : <TreeCollapse size="XS" />}
        </span>
        Notes
        {collapsed ? null : <TextareaAutosize value={notes} onChange={setNotes} />}
      </label>
      <TextField label="Keywords" value={keywords} width="100%" onChange={setKeywords} />
    </div>
  );
};

const Metadata = ({ data, setMetadata }) => {
  const { items } = data;
  const { id } = useParams();
  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);

  const { metadata = [] } = item ?? {};

  console.log({ metadata });

  return (
    <Flex direction="row" gap="size-100" height="100%">
      <View gap="size-100" flex UNSAFE_style={{ overflowY: 'scroll' }}>
        <Content margin="size-200">
          {[...metadata]
            .sort(({ time: a }, { time: b }) => a - b)
            .map((segment, index) => (
              <Segment key={`${index}-${segment.time}`} {...segment} setMetadata={setMetadata} id={id} />
            ))}
        </Content>
      </View>
    </Flex>
  );
};

export default connect(({ data }) => ({ data }), { setMetadata })(Metadata);
