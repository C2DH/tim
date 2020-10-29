import React, { useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { atom, useRecoilState } from 'recoil';

import { connect } from 'react-redux';

import { Flex, View, ActionGroup, Item, ActionButton, Text, Switch as Toggle } from '@adobe/react-spectrum';
import Alert from '@spectrum-icons/workflow/Alert';

const transcriptVisibleState = atom({
  key: 'transcriptVisible',
  default: false,
});

const Tabs = ({ data: { items }, selected }) => {
  const history = useHistory();
  const { id } = useParams();

  const item = useMemo(() => items.find(({ id: _id }) => id === _id), [items, id]);
  const { metadata = [] } = item ?? {};
  const outOfSequence = useMemo(
    () => metadata.find(({ time }, index) => index > 0 && time < metadata[index - 1].time),
    [metadata]
  );

  const [transcriptVisible, setTranscriptVisible] = useRecoilState(transcriptVisibleState);

  return (
    <View>
      <Flex direction="row" marginX="size-200" gap="size-100">
        <ActionGroup
          selectionMode="single"
          selectedKeys={[selected]}
          onSelectionChange={selection => history.push(`/${[...selection].pop()}/${id}`)}
        >
          <Item key="notes">Notes</Item>
          <Item key="metadata">Preview</Item>
        </ActionGroup>
        <Toggle isSelected={transcriptVisible} onChange={setTranscriptVisible}>
          Transcript
        </Toggle>
        {outOfSequence ? (
          <ActionButton isQuiet isDisabled>
            <Alert size="S" />
            <Text>Segments not in time order</Text>
          </ActionButton>
        ) : null}
      </Flex>
    </View>
  );
};

export default connect(({ data }) => ({ data }), {})(Tabs);
