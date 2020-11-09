import React, { useMemo, useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import timecode from 'smpte-timecode';

import { Flex, View, Content, TextField } from '@adobe/react-spectrum';
import TreeCollapse from '@spectrum-icons/workflow/TreeCollapse';
import TreeExpand from '@spectrum-icons/workflow/TreeExpand';

import TextareaAutosize from 'react-autosize-textarea';

import { setMetadata } from '../../reducers/data';

import './Metadata.css';

const string2time = text => {
  let [ss, mm, hh = '00'] = text.replace(/\[|\]/g, '').split(':').reverse();
  if (hh.length === 1) hh = `0${hh}`;
  if (mm.length === 1) mm = `0${mm}`;

  let tc = null;
  try {
    tc = timecode(`${hh}:${mm}:${ss}:00`, 1e3);
  } catch (ignored) {}

  return tc.frameCount / 1e3;
};

const matchTimecode = text =>
  [
    ...text.matchAll(new RegExp(/\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\](?=\s+)/g)),
    ...text.matchAll(new RegExp(/\[(?:\d):(?:[012345]\d):(?:[012345]\d)\](?=\s+)/g)),
    ...text.matchAll(new RegExp(/\[(?:[012345]\d):(?:[012345]\d)\](?=\s+)/g)),
    ...text.matchAll(new RegExp(/\[(?:\d):(?:[012345]\d)\](?=\s+)/g)),
    ...text.matchAll(new RegExp(/(?!^)\[(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)\]/g)),
    ...text.matchAll(new RegExp(/(?!^)\[(?:\d):(?:[012345]\d):(?:[012345]\d)\]/g)),
    ...text.matchAll(new RegExp(/(?!^)\[(?:[012345]\d):(?:[012345]\d)\]/g)),
    ...text.matchAll(new RegExp(/(?!^)\[(?:\d):(?:[012345]\d)\]/g)),
  ]
    .map(([text]) => string2time(text))
    .reverse()
    .pop();

const Segment = ({ title, time, timecode, synopsis, notes, keywords, index, id, setMetadata, player }) => {
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

  const seekTo = useCallback(time => player.current?.seekTo(time, 'seconds'), [player]);

  const seekTimecode = useCallback(
    ({ nativeEvent: { target } }) => {
      const a = target.value.substring(0, target.selectionStart).split(' ').pop();
      const b = target.value.substring(target.selectionStart).split(' ').reverse().pop();
      const time = matchTimecode(`${a}${b}`);

      time && seekTo(time);
    },
    [seekTo]
  );

  return (
    <div className="segment" data-time={time} data-timecode={timecode}>
      <h3 onClick={() => seekTo(time)}>{timecode}</h3>
      <TextField label="Title" value={title} width="100%" onChange={setTitle} />
      <label>
        Synopsis
        <TextareaAutosize value={synopsis} onChange={setSynopsis} onClick={seekTimecode} />
      </label>
      <TextField label="Keywords" value={keywords} width="100%" onChange={setKeywords} />
      <br />
      <label>
        <span onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <TreeExpand size="XS" /> : <TreeCollapse size="XS" />}
        </span>
        Notes
        {collapsed ? null : <TextareaAutosize value={notes} onChange={setNotes} onClick={seekTimecode} />}
      </label>
    </div>
  );
};

const Metadata = ({ data, setMetadata, player }) => {
  const { items } = data;
  const { id } = useParams();
  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);

  const { metadata = [] } = item ?? {};

  return (
    <Flex direction="row" gap="size-100" height="100%">
      <View gap="size-100" flex UNSAFE_style={{ overflowY: 'scroll' }}>
        <Content margin="size-200">
          {[...metadata]
            .sort(({ time: a }, { time: b }) => a - b)
            .map((segment, index) => (
              <Segment
                key={`${index}-${segment.time}`}
                {...segment}
                setMetadata={setMetadata}
                id={id}
                player={player}
              />
            ))}
        </Content>
      </View>
    </Flex>
  );
};

export default connect(({ data }) => ({ data }), { setMetadata })(Metadata);
