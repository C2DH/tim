import React, { useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { atom, useRecoilState } from 'recoil';

import { Flex, View, Content, ActionGroup, Item, ActionButton, Switch as Toggle } from '@adobe/react-spectrum';

const transcriptVisibleState = atom({
  key: 'transcriptVisible',
  default: false,
});

const Tabs = () => {
  const history = useHistory();
  const { id } = useParams();
  const [transcriptVisible, setTranscriptVisible] = useRecoilState(transcriptVisibleState);

  return (
    <View>
      <Flex direction="row" marginX="size-100" gap="size-100">
        <ActionButton onPress={() => history.push(`/notes/${id}`)}>Notes</ActionButton>
        <ActionButton onPress={() => history.push(`/metadata/${id}`)}>Metadata</ActionButton>
        <Toggle isSelected={transcriptVisible} onChange={setTranscriptVisible}>
          Transcript
        </Toggle>
      </Flex>
    </View>
  );
};

export default Tabs;
