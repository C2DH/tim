import React, { useRef } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { atom, useRecoilValue } from 'recoil';

import { Flex, View } from '@adobe/react-spectrum';

import Transport from './components/Player/Transport';
import Tabs from './components/Tabs';
import Notes from './components/Notes/Notes';
import CreateNote from './components/Notes/CreateNote';

import Metadata from './components/Metadata/Metadata';
import Transcript from './components/Transcript/Transcript';
import Player from './components/Player/Player';

import './App.css';

const transcriptVisibleState = atom({
  key: 'transcriptVisible',
  default: false,
});

const App = () => {
  const player = useRef(null);

  const transcriptVisible = useRecoilValue(transcriptVisibleState);

  return (
    <Flex direction="column" gap="size-100" height="100vh">
      <Switch>
        <Route exact path="/">
          <Redirect to="/new" />
        </Route>
        <Route path={['/new', '/notes/:id', '/metadata/:id']}>
          <View height="size-800">
            <Transport player={player} />
          </View>

          <Flex direction="row" gap="size-100" flex UNSAFE_style={{ overflow: 'hidden' }}>
            <View width="size-5000">
              <Player ref={player} />
            </View>
            {transcriptVisible ? (
              <View width="size-5000" UNSAFE_style={{ overflowY: 'scroll' }}>
                <Transcript player={player} />
              </View>
            ) : null}

            <Switch>
              <Route exact path="/new">
                <CreateNote />
              </Route>
              <Route exact path="/notes/:id">
                <Flex direction="column" gap="size-100" height="100%" width="100%" flex>
                  <Tabs />
                  <Notes player={player} />
                </Flex>
              </Route>
              <Route path="/metadata/:id">
                <Flex direction="column" gap="size-100" height="100%" width="100%" flex>
                  <Tabs />
                  <Metadata />
                </Flex>
              </Route>
              <Route path="*">
                <Redirect to="/" />
              </Route>
            </Switch>
          </Flex>
        </Route>
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>

      <View height="size-400">(footer)</View>
    </Flex>
  );
};

export default App;
