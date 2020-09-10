import React, { useState, useCallback, useMemo } from 'react';
import ReactPlayer from 'react-player';
import { Resizable, ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';

import './Player.css';
import 'react-resizable/css/styles.css';

const Player = () => {
  return (
    <Draggable handle=".drag-handle" positionOffset={{ x: '50px', y: '0' }}>
      <ResizableBox width={300} height={194} minConstraints={[200, 113]} maxConstraints={[720, 480]}>
        <>
          <ReactPlayer url="https://www.youtube.com/watch?v=efs3QRr8LWw" />
          <span className="drag-handle"></span>
        </>
      </ResizableBox>
    </Draggable>
  );
};

export default Player;
