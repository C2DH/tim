import React, { useRef } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { atom, useRecoilValue } from 'recoil';

import { Flex, View, Content, ActionGroup, Item, Switch as Toggle } from '@adobe/react-spectrum';

import Transport from './components/Player/Transport';
import Notes from './components/Notes/Notes';
import Toolbar from './components/Notes/Toolbar';
import Metadata from './components/Metadata/Metadata';
import Transcript from './components/Transcript/Transcript';
import Player from './components/Player/Player';

import './App.css';

const transcriptVisibleState = atom({
  key: 'transcriptVisible',
  default: false,
});

const App = () => {
  const history = useHistory();
  const player = useRef(null);

  const transcriptVisible = useRecoilValue(transcriptVisibleState);

  return (
    <Flex direction="column" gap="size-100" height="100vh">
      <View height="size-800">
        <Transport player={player} />
      </View>
      <View>
        <Flex direction="row" marginX="size-100">
          <ActionGroup
            marginStart="size-700"
            marginEnd="size-100"
            selectionMode="single"
            defaultSelectedKeys={['notes']}
            onAction={action => history.push(action === 'notes' ? '/' : '/metadata')}
          >
            <Item key="notes">Notes</Item>
            <Item key="metadata">Metadata</Item>
          </ActionGroup>
          <Toggle>Transcript</Toggle>
        </Flex>
      </View>
      <Flex direction="row" gap="size-100" flex UNSAFE_style={{ overflow: 'hidden' }}>
        <View width="size-5000">
          <Player ref={player} />
        </View>
        {transcriptVisible ? (
          <View width="size-5000" UNSAFE_style={{ overflowY: 'scroll' }}>
            <Transcript />
          </View>
        ) : null}

        <Switch>
          <Route exact path="/">
            <Notes player={player} />
          </Route>
          <Route path="/metadata">
            <Metadata />
          </Route>
        </Switch>
        <View margin="size-100">
          <Toolbar />
        </View>
      </Flex>
      <View height="size-800">(footer)</View>
    </Flex>
  );
};

export default App;
