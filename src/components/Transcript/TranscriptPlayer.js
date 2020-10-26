import React, { useCallback, useState } from 'react';
import timecode from 'smpte-timecode';

import { Switch as Toggle } from '@adobe/react-spectrum';

import Karaoke from './Karaoke';

import './TranscriptPlayer.css';

const TranscriptPlayer = ({ transcript, player }) => {
  const [timecodesVisible, setTimecodesVisible] = useState(false);
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

  const handleCopy = useCallback(({ nativeEvent: event }) => {
    const selection = document.getSelection();
    const { anchorNode } = selection;

    const node = anchorNode.nodeType === document.TEXT_NODE ? anchorNode.parentNode : anchorNode;
    const start = node.getAttribute('data-start');

    if (!!start) {
      const tc = timecode(start * 1e3, 1e3);
      const [hh, mm, ss, mmm] = tc.toString().split(':');

      event.clipboardData.setData('text/plain', `[${hh}:${mm}:${ss}] ${selection.toString().trim()}`);
      event.preventDefault();
    }
  }, []);

  return (
    <div>
      <Toggle isSelected={timecodesVisible} onChange={setTimecodesVisible}>
        Timecodes
      </Toggle>
      <div className={`transcript timecodes-${timecodesVisible}`} onClick={handleClick} onCopy={handleCopy}>
        <Karaoke transcript={transcript} />
        {transcript.map(({ id, start, end, items }) => {
          let tc = '';
          if (!!start) {
            const [hh, mm, ss, mmm] = timecode(start * 1e3, 1e3)
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
    </div>
  );
};

export default TranscriptPlayer;
