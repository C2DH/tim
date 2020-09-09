import React from 'react';
import { Flex, View, ActionGroup, Item } from '@adobe/react-spectrum';
import Comment from '@spectrum-icons/workflow/Comment';
import Clock from '@spectrum-icons/workflow/Clock';
import TextParagraph from '@spectrum-icons/workflow/TextParagraph';
import ViewList from '@spectrum-icons/workflow/ViewList';
import FileTxt from '@spectrum-icons/workflow/FileTxt';

import './App.css';

function App() {
  return (
    <Flex direction="column" gap="size-100" minHeight="100vh">
      <View backgroundColor="celery-600" height="size-800" />
      <Flex direction="row" gap="size-100" flex>
        <View flex>
          <ActionGroup selectionMode="multiple" defaultSelectedKeys={['notes']}>
            <Item key="notes">Notes</Item>
            <Item key="metadata">Metadata</Item>
          </ActionGroup>
        </View>
        <View width="size-5000">
          <ActionGroup orientation="vertical">
            <Item key="transcript" aria-label="Transcript">
              <Comment />
            </Item>
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
        </View>
      </Flex>
      <View backgroundColor="magenta-600" height="size-800" />
    </Flex>
  );
}

export default App;
