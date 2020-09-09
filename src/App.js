import React from 'react';
import { Flex, View, Content, ActionGroup, Item } from '@adobe/react-spectrum';
import Comment from '@spectrum-icons/workflow/Comment';
import Clock from '@spectrum-icons/workflow/Clock';
import TextParagraph from '@spectrum-icons/workflow/TextParagraph';
import ViewList from '@spectrum-icons/workflow/ViewList';
import FileTxt from '@spectrum-icons/workflow/FileTxt';

import Editor from './components/Editor';

import './App.css';

function App() {
  return (
    <Flex direction="column" gap="size-100" minHeight="100vh">
      <View backgroundColor="celery-600" height="size-800">
        player, etc.
      </View>
      <View>
        <ActionGroup selectionMode="single" defaultSelectedKeys={['notes']}>
          <Item key="notes">Notes</Item>
          <Item key="metadata">Metadata</Item>
        </ActionGroup>
      </View>
      <Flex direction="row" gap="size-100" flex>
        <View flex>
          <Content margin="size-100">
            <Editor />
          </Content>
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
      <View backgroundColor="magenta-600" height="size-800">
        footer
      </View>
    </Flex>
  );
}

export default App;
