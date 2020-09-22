/* eslint-disable no-unused-expressions */
import React, { useCallback, useMemo } from 'react';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import {
  Flex,
  ProgressBar,
  ActionGroup,
  Item,
  MenuTrigger,
  Menu,
  ActionButton,
  TextField,
  Text,
  DialogTrigger,
  Dialog,
  Divider,
  Heading,
  Content,
  ButtonGroup,
  Button,
  Picker,
  Switch,
} from '@adobe/react-spectrum';
import Play from '@spectrum-icons/workflow/Play';
import Pause from '@spectrum-icons/workflow/Pause';
import Rewind from '@spectrum-icons/workflow/Rewind';
import FastForward from '@spectrum-icons/workflow/FastForward';
import Fast from '@spectrum-icons/workflow/Fast';
import NewItem from '@spectrum-icons/workflow/NewItem';
import Export from '@spectrum-icons/workflow/Export';
import Settings from '@spectrum-icons/workflow/Settings';

import timecode from 'smpte-timecode';

import './Transport.css';

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

const readyState = atom({
  key: 'readyState',
  default: false,
});

const Transport = ({ player }) => {
  const duration = useRecoilValue(durationState);
  const progress = useRecoilValue(progressState);
  const ready = useRecoilValue(readyState);
  const [playing, setPlaying] = useRecoilState(playState);

  const durationTC = useMemo(() => {
    const tc = timecode(duration * 1e3, 1e3);
    const [hh, mm, ss] = tc.toString().split(':');
    return `${hh}:${mm}:${ss}`;
  }, [duration]);

  const progressTC = useMemo(() => {
    const tc = timecode(progress * 1e3, 1e3);
    const [hh, mm, ss] = tc.toString().split(':');
    return `${hh}:${mm}:${ss}`;
  }, [progress]);

  const ffw = useCallback(() => player.current?.seekTo(progress + 1, 'seconds'), [player, progress]);
  const rwd = useCallback(() => player.current?.seekTo(progress - 1, 'seconds'), [player, progress]);

  const setAction = useCallback(
    action => {
      switch (action) {
        case 'play':
          setPlaying(true);
          break;
        case 'pause':
          setPlaying(false);
          break;
        case 'ffw':
          ffw();
          break;
        case 'rwd':
          rwd();
          break;
        default:
          console.warn('unhandled action', action);
      }
    },
    [setPlaying, rwd, ffw]
  );

  return (
    <>
      <Flex direction="row" gap="size-150">
        <ActionGroup isQuiet isDisabled={!ready} onAction={setAction}>
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
        </ActionGroup>
        <MenuTrigger>
          <ActionButton aria-label="Playback rate" isQuiet isDisabled={!ready}>
            <Fast />
          </ActionButton>
          <Menu>
            <Item>1×</Item>
            <Item>2×</Item>
          </Menu>
        </MenuTrigger>
        <ActionButton isQuiet isDisabled={!ready}>
          <Text>
            {progressTC} / {durationTC}
          </Text>
        </ActionButton>
        <TextField aria-label="name" isQuiet flex={1} />
        <DialogTrigger type="popover">
          <ActionButton isQuiet aria-label="New">
            <NewItem />
          </ActionButton>
          <Dialog>
            <Heading>New</Heading>
            <Divider />
            <Content>
              <Text>new…</Text>
            </Content>
          </Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover">
          <ActionButton isQuiet aria-label="Export">
            <Export />
          </ActionButton>
          {close => (
            <Dialog>
              <Heading>Export</Heading>
              <Divider />
              <Content>
                <Picker label="Choose format">
                  <Item key="md">Text (Markdown)</Item>
                  <Item key="csv">CSV</Item>
                  <Item key="ohms">XML (OHMS)</Item>
                  <Item key="vtt">VTT</Item>
                  <Item key="json">JSON</Item>
                </Picker>
              </Content>
              <ButtonGroup>
                <Button variant="secondary" onPress={close}>
                  Cancel
                </Button>
                <Button variant="cta" onPress={close}>
                  Export
                </Button>
              </ButtonGroup>
            </Dialog>
          )}
        </DialogTrigger>
        <DialogTrigger isDismissable>
          <ActionButton isQuiet aria-label="Settings">
            <Settings />
          </ActionButton>
          <Dialog>
            <Heading>Settings</Heading>
            <Divider />
            <Content>
              <Switch defaultSelected>Convert timecode to links</Switch>
            </Content>
          </Dialog>
        </DialogTrigger>
      </Flex>

      <Flex direction="row" marginTop="size-150" UNSAFE_className="timeline">
        <ProgressBar minValue={0} maxValue={duration} value={progress} width={'100%'} aria-label="progress" />
      </Flex>
    </>
  );
};

export default Transport;
