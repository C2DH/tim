import React from 'react';
import { Switch, Route, Link, useHistory } from 'react-router-dom';
import { Flex, View, Content, ActionGroup, Item, ActionButton, MenuTrigger, Menu, Text } from '@adobe/react-spectrum';

import Play from '@spectrum-icons/workflow/Play';
import Rewind from '@spectrum-icons/workflow/Rewind';
import FastForward from '@spectrum-icons/workflow/FastForward';

import Fast from '@spectrum-icons/workflow/Fast';

import Comment from '@spectrum-icons/workflow/Comment';
import Clock from '@spectrum-icons/workflow/Clock';
import TextParagraph from '@spectrum-icons/workflow/TextParagraph';
import ViewList from '@spectrum-icons/workflow/ViewList';
import FileTxt from '@spectrum-icons/workflow/FileTxt';

import Editor from './components/Editor';
import Metadata from './components/Metadata';
import Player from './components/Player';

import './App.css';

const App = () => {
  let history = useHistory();
  console.log(history);

  return (
    <Flex direction="column" gap="size-100" minHeight="100vh">
      <View height="size-800">
        <ActionGroup isQuiet>
          <Item key="play" aria-label="Play">
            <Play />
          </Item>
          <Item key="rwd" aria-label="Rewind">
            <Rewind />
          </Item>
          <Item key="ffw" aria-label="Fast Forward">
            <FastForward />
          </Item>
          <Item key="speed" aria-label="Speed">
            <MenuTrigger>
              <ActionButton isQuiet>
                <Fast />
              </ActionButton>
              <Menu>
                <Item>1×</Item>
                <Item>2×</Item>
              </Menu>
            </MenuTrigger>
          </Item>
        </ActionGroup>
      </View>
      <View>
        <ActionGroup
          selectionMode="single"
          defaultSelectedKeys={['notes']}
          onAction={action => history.push(action === 'notes' ? '/' : '/metadata')}
        >
          <Item key="notes">Notes</Item>
          <Item key="metadata">Metadata</Item>
        </ActionGroup>
      </View>
      <Flex direction="row" gap="size-100" flex>
        <View flex>
          <Content margin="size-100">
            <Switch>
              <Route exact path="/">
                <Editor />
              </Route>
              <Route path="/metadata">
                <Metadata />
              </Route>
            </Switch>
          </Content>
        </View>
        <View width="size-5000">
          <Player />
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
      <View height="size-800">(footer)</View>
    </Flex>
  );
};

export default App;
