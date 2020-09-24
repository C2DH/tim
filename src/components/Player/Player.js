import React, { forwardRef, useState, useMemo, useCallback, useRef } from 'react';
import { atom, useRecoilState } from 'recoil';
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
  DialogTrigger,
  Dialog,
  ButtonGroup,
  Button,
  TextField,
} from '@adobe/react-spectrum';

import NotFound from '@spectrum-icons/illustrations/NotFound';
import CloseCircle from '@spectrum-icons/workflow/CloseCircle';

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

const Player = (props, ref) => {
  const [, setDuration] = useRecoilState(durationState);
  const [, setProgress] = useRecoilState(progressState);
  const [, setReady] = useRecoilState(readyState);
  const [playing, setPlaying] = useRecoilState(playState);

  const [text, setText] = useState('');
  const [type, setType] = useState('video');
  const [url, setUrl] = useState(null);

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

  return url ? (
    <Draggable handle=".drag-handle" positionOffset={{ x: '10px', y: '0' }} forwardedRef={ref}>
      <ResizableBox width={300} height={194} minConstraints={[200, 113]} maxConstraints={[720, 480]}>
        <>
          <ReactPlayer
            controls
            {...{ ref, url, config, playing, onPlay, onPause, onDuration, onProgress, onReady, onError }}
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
            <ActionButton onPress={triggerFileInput}>media file</ActionButton>
            <input
              type="file"
              accept="audio/*, video/*"
              onChange={loadFile}
              ref={fileInput}
              pip={true}
              aria-label="Choose media file"
            />

            <Text>or</Text>
            <DialogTrigger type="popover">
              <ActionButton>URL</ActionButton>
              {close => (
                <Dialog>
                  <Content>
                    <TextField
                      label="URL"
                      width="100%"
                      value={text}
                      onChange={setText}
                      validationState={isValid ? 'valid' : 'invalid'}
                    />
                  </Content>
                  <ButtonGroup>
                    <Button variant="secondary" onPress={close}>
                      Cancel
                    </Button>
                    <Button variant="cta" onPress={() => setUrl(text)} isDisabled={!isValid}>
                      Load
                    </Button>
                  </ButtonGroup>
                </Dialog>
              )}
            </DialogTrigger>
          </Flex>
        </Content>
      </IllustratedMessage>
    </Well>
  );
};

export default forwardRef(Player);
