import React, { useState, useCallback, useRef } from 'react';
// import { atom, useRecoilState, useRecoilValue } from 'recoil';
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

const Transcript = () => {
  // const [text, setText] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [url, setUrl] = useState(null);

  // const isValid = true; // useMemo(() => ReactPlayer.canPlay(text), [text]);

  const loadFile = useCallback(({ nativeEvent: { target: { files } } }) => {
    if (files.length > 0) {
      const blob = window.URL.createObjectURL(files[0]);
      setUrl(blob);
    }
  }, []);

  const fileInput = useRef(null);
  const triggerFileInput = useCallback(() => fileInput.current.click(), [fileInput]);

  return (
    <Well marginX="size-500">
      <IllustratedMessage>
        <NotFound />
        <Heading>No Transcript</Heading>
        <Content>
          <Flex direction="column" gap="size-50">
            <Text>Choose</Text>
            <ActionButton isDisabled onPress={triggerFileInput}>
              transcript file
            </ActionButton>
            <input
              disabled
              type="file"
              accept="text/*, application/json"
              onChange={loadFile}
              ref={fileInput}
              aria-label="Choose transcript file"
            />

            <Text>or paste here</Text>
            <TextArea aria-label="transcript content" />
            <Picker label="Choose format">
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
            <ActionButton isDisabled>Load</ActionButton>
          </Flex>
        </Content>
      </IllustratedMessage>
    </Well>
  );
};

export default Transcript;
