import React, { useCallback, useMemo } from 'react';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
// import { useEditor } from 'slate-react';
// import { Editor, Node, Text, Range, createEditor } from 'slate';

import { ActionGroup, Item } from '@adobe/react-spectrum';

// import Comment from '@spectrum-icons/workflow/Comment';
import Clock from '@spectrum-icons/workflow/Clock';
import TextParagraph from '@spectrum-icons/workflow/TextParagraph';
import ViewList from '@spectrum-icons/workflow/ViewList';
import FileTxt from '@spectrum-icons/workflow/FileTxt';

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
      <Item key="timecode" aria-label="Timecode">
        <Clock />
      </Item>
      <Item key="title" aria-label="Title">
        <TextParagraph />
      </Item>
      <Item key="keyword" aria-label="Keyword">
        <ViewList />
      </Item>
      <Item key="synopsis" aria-label="Synopsis">
        <FileTxt />
      </Item>
    </ActionGroup>
  );
};

export default Toolbar;

// <Item key="transcript" aria-label="Transcript">
//         <Comment />
//       </Item>
