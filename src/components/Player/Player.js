import React, { forwardRef, useState, useMemo, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import { atom, useRecoilState, useRecoilValue } from 'recoil';

import ReactPlayer from 'react-player';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';

import {
  IllustratedMessage,
  Heading,
  Content,
  Well,
  ActionButton,
  Text,
  Flex,
  Button,
  TextField,
} from '@adobe/react-spectrum';

import NotFound from '@spectrum-icons/illustrations/NotFound';
import CloseCircle from '@spectrum-icons/workflow/CloseCircle';

import { update, set } from '../../reducers/data';

import './Player.css';
import 'react-resizable/css/styles.css';

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

const Player = ({ data: { items = [] }, set, update }, ref) => {
  const { id } = useParams();
  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);
  const { url } = item ?? {};

  const [, setDuration] = useRecoilState(durationState);
  const [, setProgress] = useRecoilState(progressState);
  const [, setReady] = useRecoilState(readyState);
  const [playing, setPlaying] = useRecoilState(playState);
  const playbackRate = useRecoilValue(playbackRateState);

  const [text, setText] = useState('');
  const [type, setType] = useState('video');

  const setUrl = useCallback(url => set([id, 'url', url]), [id, set]);

  const isValid = useMemo(() => ReactPlayer.canPlay(text), [text]);
  const config = useMemo(
    () => ({
      file: {
        forceAudio: type === 'audio',
        forceVideo: type === 'video',
      },
    }),
    [type]
  );

  const loadFile = useCallback(
    ({
      nativeEvent: {
        target: { files },
      },
    }) => {
      if (files.length > 0) {
        console.log(files);
        const blob = window.URL.createObjectURL(files[0]);
        setType(files[0].type.split('/')[0]);
        setUrl(blob);
      }
    },
    [setType, setUrl]
  );

  const reset = useCallback(() => {
    setUrl(null);
    setDuration(0);
    setProgress(0);
  }, [setUrl, setDuration, setProgress]);

  const onPlay = useCallback(() => setPlaying(true), [setPlaying]);
  const onPause = useCallback(() => setPlaying(false), [setPlaying]);
  const onDuration = useCallback(d => setDuration(d), [setDuration]);
  const onProgress = useCallback(({ playedSeconds }) => setProgress(playedSeconds), [setProgress]);
  const onReady = useCallback(() => setReady(true), [setReady]);
  const onError = useCallback(() => setReady(false), [setReady]);

  const fileInput = useRef(null);
  const triggerFileInput = useCallback(() => fileInput.current.click(), [fileInput]);

  return item ? (
    url ? (
      <Draggable handle=".drag-handle" positionOffset={{ x: '20px', y: '10px' }} forwardedRef={ref}>
        <ResizableBox width={300} height={194} minConstraints={[200, 113]} maxConstraints={[720, 480]}>
          <>
            <ReactPlayer
              controls
              progressInterval={75}
              {...{
                ref,
                url,
                config,
                playing,
                onPlay,
                onPause,
                onDuration,
                onProgress,
                onReady,
                onError,
                playbackRate,
              }}
            />
            <span className="drag-handle"></span>
            <ActionButton aria-label="Close player" isQuiet onPress={reset}>
              <CloseCircle />
            </ActionButton>
          </>
        </ResizableBox>
      </Draggable>
    ) : (
      <Well marginX="size-500">
        <IllustratedMessage>
          <NotFound />
          <Heading>No Media</Heading>
          <Content>
            <Flex direction="column" gap="size-50">
              <Text>Choose</Text>
              <ActionButton isDisabled={!item} onPress={triggerFileInput}>
                media file
              </ActionButton>
              <input
                type="file"
                accept="audio/*, video/*"
                onChange={loadFile}
                ref={fileInput}
                aria-label="Choose media file"
              />

              <Text>or load URL</Text>

              <TextField
                autoFocus
                aria-label="URL"
                width="100%"
                value={text}
                onChange={setText}
                validationState={text === '' ? null : isValid ? 'valid' : 'invalid'}
              />
              <Button variant="cta" onPress={() => setUrl(text)} isDisabled={!isValid || text === ''}>
                Load
              </Button>
            </Flex>
          </Content>
        </IllustratedMessage>
      </Well>
    )
  ) : null;
};

export default connect(({ data }) => ({ data }), { update, set }, null, { forwardRef: true })(forwardRef(Player));
