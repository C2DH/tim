import React, { useCallback } from 'react';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { Flex, ProgressBar, ActionGroup, Item, MenuTrigger, Menu, ActionButton } from '@adobe/react-spectrum';
import Play from '@spectrum-icons/workflow/Play';
import Pause from '@spectrum-icons/workflow/Pause';
import Rewind from '@spectrum-icons/workflow/Rewind';
import FastForward from '@spectrum-icons/workflow/FastForward';
import Fast from '@spectrum-icons/workflow/Fast';

// import './Transport.css';

const durationState = atom({
  key: 'durationState',
  default: 0,
});

const progressState = atom({
  key: 'progressState',
  default: 0,
});

const playState = atom({
  key: 'playState',
  default: false,
});

const Timeline = () => {
  const duration = useRecoilValue(durationState);
  const progress = useRecoilValue(progressState);
  const [playing, setPlaying] = useRecoilState(playState);

  const setAction = useCallback(
    action => {
      switch (action) {
        case 'play':
          setPlaying(true);
          break;
        case 'pause':
          setPlaying(false);
          break;
        default:
          console.log(action);
      }
    },
    [setPlaying]
  );

  return (
    <Flex direction="column" onClick={e => console.log(e)}>
      <ActionGroup isQuiet onAction={setAction}>
        {playing ? (
          <Item key="pause" aria-label="Pause">
            <Pause />
          </Item>
        ) : (
          <Item key="play" aria-label="Play">
            <Play />
          </Item>
        )}
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
      <ProgressBar minValue={0} maxValue={duration} value={progress} flex={1} width={'100%'} aria-label="progress" />
    </Flex>
  );
};

export default Timeline;
