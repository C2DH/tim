import React, { useCallback, useMemo } from 'react';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
// import { useEditor } from 'slate-react';
// import { Editor, Node, Text, Range, createEditor } from 'slate';

import { ActionGroup, Item, TooltipTrigger, Tooltip, Text } from '@adobe/react-spectrum';

// import Comment from '@spectrum-icons/workflow/Comment';
import Clock from '@spectrum-icons/workflow/Clock';

const transcriptVisibleState = atom({
  key: 'transcriptVisible',
  default: false,
});

const titleState = atom({
  key: 'titleState',
  default: false,
});

const synopsisState = atom({
  key: 'synopsisState',
  default: false,
});

const Toolbar = () => {
  const [transcriptVisible, setTranscriptVisible] = useRecoilState(transcriptVisibleState);
  const isTitle = useRecoilValue(titleState);
  const isSynopsis = useRecoilValue(synopsisState);

  // const editor = useEditor();

  // if (transcriptVisible) selected.push('transcript');
  // if (isTitle) selected.push('title');

  const selected = useMemo(
    () => [transcriptVisible ? 'transcript' : null, isTitle ? 'title' : null, isSynopsis ? 'synopsis' : null],
    [transcriptVisible, isTitle, isSynopsis]
  );

  const setAction = useCallback(
    action => {
      switch (action) {
        case 'transcript':
          setTranscriptVisible(!transcriptVisible);
          break;
        default:
          console.warn('unhandled action', action);
      }
    },
    [transcriptVisible, setTranscriptVisible]
  );

  return (
    <ActionGroup orientation="vertical" selectionMode="multiple" selectedKeys={selected} onAction={setAction}>
      <TooltipTrigger delay={0} placement="left">
        <Item key="timecode" aria-label="Timecode">
          <Clock />
        </Item>
        <Tooltip>Timecode</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left">
        <Item key="title" aria-label="Title">
          <Text>T</Text>
        </Item>
        <Tooltip>Title</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left">
        <Item key="synopsis" aria-label="Synopsis">
          <Text>S</Text>
        </Item>
        <Tooltip>Synopsis</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0} placement="left">
        <Item key="keyword" aria-label="Keyword">
          <Text>K</Text>
        </Item>
        <Tooltip>Keyword</Tooltip>
      </TooltipTrigger>
    </ActionGroup>
  );
};

export default Toolbar;

// <Item key="transcript" aria-label="Transcript">
//         <Comment />
//       </Item>
