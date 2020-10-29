import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import { update } from '../reducers/data';

import {
  ActionButton,
  DialogTrigger,
  Dialog,
  Divider,
  Heading,
  Content,
  Checkbox,
  TextField,
} from '@adobe/react-spectrum';

import SettingsIcon from '@spectrum-icons/workflow/Settings';

const Settings = ({
  data: { convertTimecodes = true, skipIncrement = 1, timecodeInterval = 1, partialTranscript = true },
  update,
}) => {
  const setConvertTimecodes = useCallback(convertTimecodes => update({ convertTimecodes }), [update]);
  const setPartialTranscript = useCallback(partialTranscript => update({ partialTranscript }), [update]);
  const setSkipIncrement = useCallback(skipIncrement => update({ skipIncrement }), [update]);
  const setTimecodeInterval = useCallback(timecodeInterval => update({ timecodeInterval }), [update]);

  return (
    <DialogTrigger isDismissable>
      <ActionButton isQuiet aria-label="Settings">
        <SettingsIcon />
      </ActionButton>
      <Dialog>
        <Heading>Settings</Heading>
        <Divider />
        <Content>
          <Checkbox isSelected={convertTimecodes} onChange={setConvertTimecodes}>
            Convert timecodes to markers
          </Checkbox>
          <Checkbox isSelected={partialTranscript} onChange={setPartialTranscript}>
            Export Notes as Partial Transcript in OHMS XML
          </Checkbox>
          <TextField
            inputMode="numeric"
            type="number"
            labelPosition="right"
            label="Skip forward and back increments (seconds)"
            value={skipIncrement}
            onChange={setSkipIncrement}
          />
          <TextField
            inputMode="numeric"
            type="number"
            labelPosition="right"
            label="Interval between timecodes upon multi-timecode insertion (seconds)"
            value={timecodeInterval}
            onChange={setTimecodeInterval}
          />
        </Content>
      </Dialog>
    </DialogTrigger>
  );
};

export default connect(({ data }) => ({ data }), { update })(Settings);
