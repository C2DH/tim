import React, { useCallback, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import { atom, useRecoilValue } from 'recoil';

import { update, set } from '../../reducers/data';

import { Flex } from '@adobe/react-spectrum';

import './Timeline.css';

const durationState = atom({
  key: 'durationState',
  default: 0,
});

const progressState = atom({
  key: 'progressState',
  default: 0,
});

const Markers = ({ duration, timecodes }) =>
  duration
    ? timecodes.map(({ title, timecode, time, section }, index) => (
        <div
          title={title}
          key={`${index}-${time}`}
          className={`marker section-${section}`}
          style={{ left: `${(100 * time) / duration}%` }}
        ></div>
      ))
    : null;

const Timeline = ({ player, item: { metadata = [] } = {}, set }) => {
  const duration = useRecoilValue(durationState);
  const progress = useRecoilValue(progressState);

  const timecodes = useMemo(
    () => [
      ...metadata.map(({ section, timecode, time, title, lines }, index) => ({
        section: true,
        timecode,
        time,
        title,
      })),
      ...metadata.flatMap(({ timecodes }) =>
        timecodes.map(({ time, timecode }) => ({ time, timecode, title: timecode }))
      ),
    ],
    [metadata]
  );

  const timeline = useRef(null);

  const handleTimelineClick = useCallback(
    ({ nativeEvent: { clientX } }) => {
      const { width } = timeline.current?.getClientRects()[0];
      // eslint-disable-next-line no-unused-expressions
      player.current?.seekTo((duration * clientX) / width, 'seconds');
    },
    [timeline, duration, player]
  );

  return (
    <Flex direction="row" marginTop="size-150">
      <div className="timeline" onClick={handleTimelineClick} ref={timeline}>
        <div className="progress" style={{ width: `${duration === 0 ? 0 : (100 * progress) / duration}%` }}></div>
        <Markers {...{ duration, timecodes }} />
      </div>
    </Flex>
  );
};

export default connect(({ data }) => ({ data }), { update, set })(Timeline);
