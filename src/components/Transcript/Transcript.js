import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

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
  View,
} from '@adobe/react-spectrum';

import NotFound from '@spectrum-icons/illustrations/NotFound';

import { update, set } from '../../reducers/data';

import TranscriptPlayer from './TranscriptPlayer';
import { parse } from './utils';

const Transcript = ({ data: { items, convertTimecodes, subSecond = false }, player, set }) => {
  const { id } = useParams();
  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);
  const { transcript } = item ?? {};

  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [format, setFormat] = useState('');

  const setTranscript = useCallback(value => set([id, 'transcript', value]), [set, id]);

  useEffect(() => {
    const validate = async () => {
      try {
        await parse(text, format);
        setIsValid(true);
      } catch (error) {
        console.error(error);
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
      console.log(files[0]);
      const extension = files[0].name.split('.').pop();
      const extensions = ['json', 'vtt', 'webvtt', 'srt', 'txt'];
      const types = ['application/json', 'text/vtt', 'text/srt', 'text/plain'];

      if (extensions.includes(extension) || types.includes(files[0].type)) {
        setText(await (await fetch(window.URL.createObjectURL(files[0]))).text());
        setFile(files[0]);
      }
    },
    [setText, setFile]
  );

  const fileInput = useRef(null);
  const triggerFileInput = useCallback(() => fileInput.current.click(), [fileInput]);

  const loadTranscript = useCallback(async () => setTranscript(await parse(text, format)), [
    text,
    format,
    setTranscript,
  ]);

  return transcript ? (
    <TranscriptPlayer {...{ transcript, player, convertTimecodes, subSecond }} />
  ) : (
    <View width="size-5000">
      <Well marginX="size-500">
        <IllustratedMessage>
          <NotFound />
          <Heading>No Transcript</Heading>
          <Content>
            <Flex direction="column" gap="size-50">
              <Text>Choose</Text>
              <ActionButton isDisabled={!item} onPress={triggerFileInput}>
                transcript file
              </ActionButton>
              <input
                type="file"
                // accept="text/*, application/json, *.json, text/vtt, *.vtt, *.webvtt, text/srt, *.srt, text/plain, *.txt"
                onChange={loadFile}
                ref={fileInput}
                aria-label="Choose transcript file"
              />
              <Text>{file ? `File: ${file.name}` : null}</Text>
              <Text>or paste here</Text>
              <TextArea
                autoFocus
                aria-label="transcript content"
                isDisabled={!item}
                value={text}
                onChange={setText}
                width="100%"
              />
              <Picker
                isDisabled={!item}
                label="Choose format"
                selectedKey={format}
                onSelectionChange={setFormat}
                validationState={format === '' || isValid ? 'valid' : 'invalid'}
              >
                <Section title="JSON">
                  <Item key="google">Google</Item>
                  <Item key="amazon">Amazon</Item>
                  <Item key="ibm">IBM</Item>
                  <Item key="speechmatics">Speechmatics</Item>
                </Section>
                <Section title="Captions">
                  <Item key="srt">SRT</Item>
                  <Item key="vtt">WebVTT</Item>
                </Section>
                <Section title="Text">
                  <Item key="text">Plain Text</Item>
                </Section>
              </Picker>
              <ActionButton isDisabled={!format || !isValid} onPress={loadTranscript}>
                Load
              </ActionButton>
            </Flex>
          </Content>
        </IllustratedMessage>
      </Well>
    </View>
  );
};

export default connect(({ data }) => ({ data }), { update, set })(Transcript);
