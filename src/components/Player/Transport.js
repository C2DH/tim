/* eslint-disable no-unused-expressions */
import React, { useCallback, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { atom, useRecoilState, useRecoilValue } from 'recoil';

import timecode from 'smpte-timecode';
import fileDownload from 'js-file-download';
import sanitize from 'sanitize-filename';

import { update, set } from '../../reducers/data';

import {
  Flex,
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
import OpenRecent from '@spectrum-icons/workflow/OpenRecent';
import SaveFloppy from '@spectrum-icons/workflow/SaveFloppy';
import Export from '@spectrum-icons/workflow/Export';

import Timeline from './Timeline';
import Settings from '../Settings';

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

const playbackRateState = atom({
  key: 'playbackRateState',
  default: 1,
});

const Transport = ({ player, data: { items, skipIncrement }, set }) => {
  const history = useHistory();
  const { id } = useParams();

  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);
  const { title = '' } = item ?? {};

  const [recent, setRecent] = useState(null);

  const duration = useRecoilValue(durationState);
  const progress = useRecoilValue(progressState);
  const ready = useRecoilValue(readyState);
  const [playing, setPlaying] = useRecoilState(playState);
  const [playbackRate, setPlaybackRate] = useRecoilState(playbackRateState);

  const disabled = useMemo(() => !ready || !item, [ready, item]);

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

  const play = useCallback(() => setPlaying(true), [setPlaying]);
  const pause = useCallback(() => setPlaying(false), [setPlaying]);
  const ffw = useCallback(() => player.current?.seekTo(progress + skipIncrement, 'seconds'), [
    player,
    progress,
    skipIncrement,
  ]);
  const rwd = useCallback(() => player.current?.seekTo(progress - skipIncrement, 'seconds'), [
    player,
    progress,
    skipIncrement,
  ]);

  const setTitle = useCallback(title => set([id, 'title', title]), [id, set]);

  const save = useCallback(() => fileDownload(JSON.stringify(item, null, 2), `${sanitize(item.title)}.json`), [item]);

  const setPlaybackRateAsFloat = useCallback(playbackRateString => setPlaybackRate(parseFloat(playbackRateString)), [
    setPlaybackRate,
  ]);

  // const openRecent = useCallback(close => close() && history.push(`/notes/${recent}`), [recent, history]);

  return (
    <>
      <Flex direction="row" gap="size-150" margin="size-100">
        {playing ? (
          <ActionButton aria-label="Pause" isQuiet isDisabled={disabled} onPress={pause}>
            <Pause />
          </ActionButton>
        ) : (
          <ActionButton aria-label="Play" isQuiet isDisabled={disabled} onPress={play}>
            <Play />
          </ActionButton>
        )}
        <ActionButton aria-label="Rewind" isQuiet isDisabled={disabled} onPress={rwd}>
          <Rewind />
        </ActionButton>
        <ActionButton aria-label="Fast Forward" isQuiet isDisabled={disabled} onPress={ffw}>
          <FastForward />
        </ActionButton>

        <MenuTrigger>
          <ActionButton aria-label="Playback rate" isQuiet isDisabled={disabled}>
            <Fast />
            <Text>{playbackRate}×</Text>
          </ActionButton>
          <Menu onAction={setPlaybackRateAsFloat}>
            <Item key={0.25}>0.25×</Item>
            <Item key={0.5}>0.5×</Item>
            <Item key={0.75}>0.75×</Item>
            <Item key={1}>1×</Item>
            <Item key={1.25}>1.25×</Item>
            <Item key={1.5}>1.50×</Item>
            <Item key={1.75}>1.75×</Item>
            <Item key={2}>2×</Item>
          </Menu>
        </MenuTrigger>

        <ActionButton isQuiet isDisabled={disabled}>
          <Text>
            {progressTC} / {durationTC}
          </Text>
        </ActionButton>

        <TextField aria-label="name" isQuiet flex={1} value={title} isDisabled={!item} onChange={setTitle} />

        <ActionButton isQuiet aria-label="New" onPress={() => history.push('/')}>
          <NewItem />
        </ActionButton>

        <DialogTrigger type="popover">
          <ActionButton isQuiet aria-label="New">
            <OpenRecent />
          </ActionButton>
          {close => (
            <Dialog>
              <Heading>Open recent</Heading>
              <Divider />
              <Content>
                <Picker label="Choose" onSelectionChange={setRecent}>
                  {[...items]
                    .sort(({ updated: a }, { updated: b }) => b - a)
                    .map(({ id, title }) => (
                      <Item key={id}>{title}</Item>
                    ))}
                </Picker>
              </Content>
              <ButtonGroup>
                <Button variant="secondary" onPress={close}>
                  Cancel
                </Button>
                <Button
                  variant="cta"
                  isDisabled={!recent}
                  onPress={() => {
                    close();
                    history.push(`/notes/${recent}`);
                  }}
                >
                  Open
                </Button>
              </ButtonGroup>
            </Dialog>
          )}
        </DialogTrigger>

        <ActionButton isQuiet aria-label="Save" isDisabled={!item} onPress={save}>
          <SaveFloppy />
        </ActionButton>

        <DialogTrigger type="popover">
          <ActionButton isQuiet aria-label="Export" isDisabled={!item}>
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

        <Settings />
      </Flex>

      <Timeline {...{ player, item }} />
    </>
  );
};

export default connect(({ data }) => ({ data }), { update, set })(Transport);
