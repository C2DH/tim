import React, { useRef } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { atom, useRecoilValue } from 'recoil';

import { Flex, View } from '@adobe/react-spectrum';

import TopBar from './components/TopBar';
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
            <TopBar player={player} />
          </View>

          <Flex direction="row" gap="size-100" flex UNSAFE_style={{ overflow: 'hidden' }}>
            <View width="size-5000">
              <Player ref={player} />
            </View>
            {transcriptVisible ? (
              <View width="size-5000">
                <Flex direction="column" gap="size-100" height="100%" flex>
                  <Transcript player={player} />
                </Flex>
              </View>
            ) : null}

            <Switch>
              <Route exact path="/new">
                <CreateNote />
              </Route>
              <Route exact path="/notes/:id">
                <Flex direction="column" gap="size-100" height="100%" flex>
                  <Tabs selected="notes" />
                  <Notes player={player} />
                </Flex>
              </Route>
              <Route path="/metadata/:id">
                <Flex direction="column" gap="size-100" height="100%" flex>
                  <Tabs selected="metadata" />
                  <Metadata player={player} />
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
    </Flex>
  );
};

export default App;
