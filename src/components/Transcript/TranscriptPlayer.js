import React, { useCallback, useState } from 'react';
import timecode from 'smpte-timecode';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';

import { Switch as Toggle, Flex, View, Text, ActionButton, Heading, Tooltip, TooltipTrigger} from '@adobe/react-spectrum';
import CloseCircle from '@spectrum-icons/workflow/CloseCircle';

import Karaoke from './Karaoke';

import './TranscriptPlayer.css';
import { set } from '../../reducers/data';

const TranscriptPlayer = ({ transcript, player, convertTimecodes = true, set}) => {
  const { id } = useParams();

  const [timecodesVisible, setTimecodesVisible] = useState(false);
  const seekTo = useCallback(time => player.current?.seekTo(time, 'seconds'), [player]);

  const clearTranscript = useCallback(() => set([id, 'transcript', null]), [id, set]);

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

  const handleCopy = useCallback(
    ({ nativeEvent: event }) => {
      if (!convertTimecodes) return;

      const selection = document.getSelection();
      const { anchorNode, focusNode } = selection;

      const aNode = anchorNode.nodeType === document.TEXT_NODE ? anchorNode.parentNode : anchorNode;
      const fNode = focusNode.nodeType === document.TEXT_NODE ? focusNode.parentNode : focusNode;
      const start = Math.min(
        parseFloat(aNode.getAttribute('data-start')),
        parseFloat(fNode.getAttribute('data-start'))
      );

      if (!isNaN(start)) {
        const tc = timecode(start * 1e3, 1e3);
        const [hh, mm, ss] = tc.toString().split(':');

        event.clipboardData.setData('text/plain', `[${hh}:${mm}:${ss}] ${selection.toString().trim()}`);
        event.preventDefault();
      }
    },
    [convertTimecodes]
  );

  return (
    <>
      <View>
        <Flex direction="row"  gap="size-100">
          <Heading level={4} marginY="4px" marginEnd="10px">Transcript</Heading>
          <Toggle isSelected={timecodesVisible} onChange={setTimecodesVisible} flex>
            Show timecodes
          </Toggle>
          <TooltipTrigger delay={0}>
            <ActionButton isQuiet aria-label="clear transcript" onPress={clearTranscript}>
              <CloseCircle />
            </ActionButton>
            <Tooltip>Clear transcript</Tooltip>
          </TooltipTrigger>
        </Flex>
      </View>
      <View width="size-5000" UNSAFE_style={{ overflowY: 'scroll' }}>
        <div className={`transcript timecodes-${timecodesVisible}`} onClick={handleClick} onCopy={handleCopy}>
          <Karaoke transcript={transcript} />
          {transcript.map(({ id, start, end, items }) => {
            let tc = '';
            if (!!start) {
              const [hh, mm, ss] = timecode(start * 1e3, 1e3)
                .toString()
                .split(':');
              tc = `${hh}:${mm}:${ss}`;
            }

            return (
              <p key={id} data-segment={id} data-start={start} data-end={end} data-tc={tc}>
                {items.map(({ id, text, start, end }) => (
                  <span key={id} data-item={id} data-start={start} data-end={end}>
                    {text}{' '}
                  </span>
                ))}
              </p>
            );
          })}
        </div>
      </View>
    </>
  );
};

export default connect(({ data }) => ({ data }), { set })(TranscriptPlayer);
