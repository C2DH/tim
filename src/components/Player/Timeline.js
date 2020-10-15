import React, { useCallback, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import { atom, useRecoilValue } from 'recoil';

import { update, set } from '../../reducers/data';

import { Flex } from '@adobe/react-spectrum';

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
    ? timecodes.map(({ title, timecode, time, section }) => (
        <div title={title} className={`marker section-${section}`} style={{ left: (100 * time) / duration }}></div>
      ))
    : null;

const Timeline = ({ player, item: { metadata = [] }, set }) => {
  const duration = useRecoilValue(durationState);
  const progress = useRecoilValue(progressState);

  const timecodes = useMemo(
    () => [
      ...metadata.map(({ section, timecode, time, title, lines }) => ({
        section: true,
        timecode,
        time,
        title: title ? lines.find(({ index }) => index === title)?.line : timecode,
      })),
      ...metadata.flatMap(({ lines }) =>
        lines.flatMap(({ timecodes, times }) =>
          timecodes.map((timecode, index) => ({
            timecode,
            time: times[index],
            title: timecode,
          }))
        )
      ),
    ],
    [metadata]
  );

  console.log(metadata, timecodes);

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
