import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { atom, useRecoilState, useRecoilValue } from 'recoil';

import timecode from 'smpte-timecode';

import { update, set } from '../../reducers/data';

import { Item, MenuTrigger, Menu, ActionButton, Text } from '@adobe/react-spectrum';

import Play from '@spectrum-icons/workflow/Play';
import Pause from '@spectrum-icons/workflow/Pause';
import Rewind from '@spectrum-icons/workflow/Rewind';
import FastForward from '@spectrum-icons/workflow/FastForward';
import Fast from '@spectrum-icons/workflow/Fast';

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

const Transport = ({ player, data: { items, skipIncrement = 1 }, set }) => {
  const { id } = useParams();
  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);

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
  const ffw = useCallback(() => player.current?.seekTo(progress + parseFloat(skipIncrement), 'seconds'), [
    player,
    progress,
    skipIncrement,
  ]);
  const rwd = useCallback(() => player.current?.seekTo(progress - parseFloat(skipIncrement), 'seconds'), [
    player,
    progress,
    skipIncrement,
  ]);

  const setPlaybackRateAsFloat = useCallback(playbackRateString => setPlaybackRate(parseFloat(playbackRateString)), [
    setPlaybackRate,
  ]);

  return (
    <>
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
    </>
  );
};

export default connect(({ data }) => ({ data }), { update, set })(Transport);
