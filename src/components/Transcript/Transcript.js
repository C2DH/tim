import React, { useState, useCallback, useRef, useEffect } from 'react';
import { atom, useRecoilState, useRecoilValue } from 'recoil';

import {
  IllustratedMessage,
  Heading,
  Content,
  Well,
  ActionButton,
  Text,
  Flex,
  Item,
  TextArea,
  Picker,
  Section,
} from '@adobe/react-spectrum';

import NotFound from '@spectrum-icons/illustrations/NotFound';

import { parse } from './utils';

import './Transcript.css';

const transcriptState = atom({
  key: 'transcriptState',
  default: false,
});

const progressState = atom({
  key: 'progressState',
  default: 0,
});

const Transcript = ({ player }) => {
  // const [, setFile] = useState(null);
  const [text, setText] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [format, setFormat] = useState('');
  const [transcript, setTranscript] = useRecoilState(transcriptState);
  const time = useRecoilValue(progressState);

  useEffect(() => {
    const validate = async () => {
      try {
        await parse(text, format);
        setIsValid(true);
      } catch (error) {
        setIsValid(false);
      }
    };
    validate();
  }, [text, format, setIsValid]);

  const loadFile = useCallback(
    async ({
      nativeEvent: {
        target: { files },
      },
    }) => {
      if (files.length === 0) return;

      // setFile(files[0]);
      setText(await (await fetch(window.URL.createObjectURL(files[0]))).text());
    },
    [setText]
  );

  const fileInput = useRef(null);
  const triggerFileInput = useCallback(() => fileInput.current.click(), [fileInput]);

  const loadTranscript = useCallback(async () => setTranscript(await parse(text, format)), [
    text,
    format,
    setTranscript,
  ]);

  const seekTo = useCallback(time => player.current?.seekTo(time, 'seconds'), [player]);

  const handleClick = useCallback(
    event => {
      const target = event.nativeEvent.srcElement;
      if (target.nodeName === 'SPAN') {
        const start = target.getAttribute('data-start');
        start && seekTo(parseFloat(start));
      }
    },
    [seekTo]
  );

  return transcript ? (
    <div className="transcript" onClick={handleClick}>
      {transcript.map(({ start, end, items }) => {
        const played = end <= time;
        const focus = start <= time && time < end;

        return (
          <p key={`s${start},${end}`} data-start={start} data-end={end} className={`played-${played} focus-${focus}`}>
            {items.map(({ text, start, end }) => (
              <span
                key={`t${start},${end}`}
                data-start={start}
                data-end={end}
                className={`played-${played || end <= time} playhead-${focus && start <= time && time < end}`}
              >
                {text}{' '}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  ) : (
    <Well marginX="size-500">
      <IllustratedMessage>
        <NotFound />
        <Heading>No Transcript</Heading>
        <Content>
          <Flex direction="column" gap="size-50">
            <Text>Choose</Text>
            <ActionButton onPress={triggerFileInput}>transcript file</ActionButton>
            <input
              type="file"
              accept="text/*, application/json, *.json, text/vtt, *.vtt, text/srt, *.srt"
              onChange={loadFile}
              ref={fileInput}
              aria-label="Choose transcript file"
            />

            <Text>or paste here</Text>
            <TextArea aria-label="transcript content" value={text} onChange={setText} />
            <Picker
              label="Choose format"
              selectedKey={format}
              onSelectionChange={setFormat}
              validationState={format === '' || isValid ? 'valid' : 'invalid'}
            >
              <Section title="JSON">
                <Item key="google">Google</Item>
                <Item key="amazon">Amazon</Item>
                <Item key="speechmatics">Speechmatics</Item>
              </Section>
              <Section title="Captions">
                <Item key="srt">SRT</Item>
                <Item key="vtt">WebVTT</Item>
              </Section>
            </Picker>
            <ActionButton isDisabled={!format || !isValid} onPress={loadTranscript}>
              Load
            </ActionButton>
          </Flex>
        </Content>
      </IllustratedMessage>
    </Well>
  );
};

export default Transcript;
