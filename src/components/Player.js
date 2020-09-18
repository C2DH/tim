import React, { forwardRef, useState, useMemo, useCallback, useRef } from 'react';
import { RecoilRoot, atom, selector, useRecoilState, useRecoilValue } from 'recoil';
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
  Divider,
  Item,
  ButtonGroup,
  Button,
  TextField,
} from '@adobe/react-spectrum';
import NotFound from '@spectrum-icons/illustrations/NotFound';

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

const Player = (props, ref) => {
  const [duration, setDuration] = useRecoilState(durationState);
  const [progress, setProgress] = useRecoilState(progressState);
  const [playing, setPlaying] = useRecoilState(playState);

  const [text, setText] = useState('');
  const [url, setUrl] = useState(null);

  const isValid = useMemo(() => ReactPlayer.canPlay(text), [text]);

  const loadFile = useCallback(({ nativeEvent: { target: { files } } }) => {
    if (files.length > 0) {
      const blob = window.URL.createObjectURL(files[0]);
      setUrl(blob);
    }
  }, []);

  const fileInput = useRef(null);
  const triggerFileInput = useCallback(() => fileInput.current.click(), [fileInput]);

  return url ? (
    <Draggable handle=".drag-handle" positionOffset={{ x: '10px', y: '0' }} forwardedRef={ref}>
      <ResizableBox width={300} height={194} minConstraints={[200, 113]} maxConstraints={[720, 480]}>
        <>
          <ReactPlayer
            ref={ref}
            controls
            onDuration={d => setDuration(d)}
            onProgress={({ playedSeconds }) => setProgress(playedSeconds)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            pip={true}
            {...{ playing, url }}
          />

          <span className="drag-handle"></span>
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
            <input type="file" accept="audio/*, video/*" onChange={loadFile} ref={fileInput} />

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
