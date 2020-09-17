import React, { forwardRef } from 'react';
import { RecoilRoot, atom, selector, useRecoilState, useRecoilValue } from 'recoil';
import ReactPlayer from 'react-player';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';

import './Player.css';
import 'react-resizable/css/styles.css';

const durationState = atom({
  key: 'durationState',
  default: 0,
});

const progressState = atom({
  key: 'progressState',
  default: 0,
});

const playState = atom({
  key: 'playState',
  default: false,
});

const Player = (props, ref) => {
  const [duration, setDuration] = useRecoilState(durationState);
  const [progress, setProgress] = useRecoilState(progressState);
  const [playing, setPlaying] = useRecoilState(playState);

  return (
    <Draggable handle=".drag-handle" positionOffset={{ x: '50px', y: '0' }} forwardedRef={ref}>
      <ResizableBox width={300} height={194} minConstraints={[200, 113]} maxConstraints={[720, 480]}>
        <>
          <ReactPlayer
            ref={ref}
            url="https://www.youtube.com/watch?v=efs3QRr8LWw"
            controls
            onDuration={d => setDuration(d)}
            onProgress={({ playedSeconds }) => setProgress(playedSeconds)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            pip={true}
            {...{ playing }}
          />
          <span className="drag-handle"></span>
        </>
      </ResizableBox>
    </Draggable>
  );
};

export default forwardRef(Player);
