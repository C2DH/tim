import React, { useCallback } from 'react';
import timecode from 'smpte-timecode';

import Karaoke from './Karaoke';

import './TranscriptPlayer.css';

const TranscriptPlayer = ({ transcript, player }) => {
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
    const start = node.getAttribute('data-start') ?? 0;

    const tc = timecode(start * 1e3, 1e3);
    const [hh, mm, ss, mmm] = tc.toString().split(':');

    event.clipboardData.setData('text/plain', `[${hh}:${mm}:${ss}] ${selection.toString().trim()}`);
    event.preventDefault();
  }, []);

  return (
    <div className="transcript" onClick={handleClick} onCopy={handleCopy}>
      <Karaoke transcript={transcript} />
      {transcript.map(({ id, start, end, items }) => {
        return (
          <p key={id} data-segment={id} data-start={start} data-end={end}>
            {items.map(({ id, text, start, end }) => (
              <span key={id} data-item={id} data-start={start} data-end={end}>
                {text}{' '}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
};

export default TranscriptPlayer;
