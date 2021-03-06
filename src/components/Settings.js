import React, { useCallback, useState } from 'react';
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
  TooltipTrigger,
  Tooltip,
} from '@adobe/react-spectrum';

import SettingsIcon from '@spectrum-icons/workflow/Settings';

const Settings = ({
  data: {
    convertTimecodes = true,
    skipIncrement = 1,
    timecodeInterval = 1,
    partialTranscript = true,
    subSecond = false,
  },
  update,
}) => {
  const setConvertTimecodes = useCallback(convertTimecodes => update({ convertTimecodes }), [update]);
  const setPartialTranscript = useCallback(partialTranscript => update({ partialTranscript }), [update]);
  const setSkipIncrement = useCallback(skipIncrement => update({ skipIncrement }), [update]);
  const setTimecodeInterval = useCallback(timecodeInterval => update({ timecodeInterval }), [update]);
  const setSubSecond = useCallback(subSecond => update({ subSecond }), [update]);

  const [settingsIsVisible, setSettingsIsVisible] = useState(false);

  return (
    <TooltipTrigger delay={0} isDisabled={settingsIsVisible}>
      <DialogTrigger isDismissable onOpenChange={isOpen => setSettingsIsVisible(isOpen)}>
        <ActionButton isQuiet aria-label="Settings">
          <SettingsIcon />
        </ActionButton>
        <Dialog>
          <Heading>Settings</Heading>
          <Divider />
          <Content>
            <Checkbox isSelected={convertTimecodes} onChange={setConvertTimecodes}>
              Add timecode when copying transcript to Notes
            </Checkbox>
            <Checkbox isSelected={partialTranscript} onChange={setPartialTranscript}>
              Export Notes as Partial Transcript in OHMS XML
            </Checkbox>
            <Checkbox isSelected={subSecond} onChange={setSubSecond}>
              Add sub-second timecodes
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
      <Tooltip>Settings</Tooltip>
    </TooltipTrigger>
  );
};

export default connect(({ data }) => ({ data }), { update })(Settings);
