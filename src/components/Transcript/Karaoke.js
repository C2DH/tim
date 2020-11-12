import React, { useMemo, useEffect } from 'react';
import { atom, useRecoilValue } from 'recoil';

const progressState = atom({
  key: 'progressState',
  default: 0,
});

const Karaoke = ({ transcript }) => {
  const time = useRecoilValue(progressState);

  const segment = useMemo(
    () =>
      transcript.find(
        ({ start, end }, index) =>
          start <= time && (time < end || (index < transcript.length - 1 && time < transcript[index + 1].start))
      ),
    [transcript, time]
  );

  const item = useMemo(
    () =>
      segment?.items
        .filter(({ start, end }) => end <= time)
        .slice(-1)
        .pop(),
    [segment, time]
  );

  useEffect(() => {
    if (!item) return;

    const el = document.querySelector(`span[data-item="${item.id}"]`);
    if (!el) return;

    el.parentNode.parentNode.parentNode.scrollTop = el.offsetTop - window.innerHeight / 2;
  }, [item]);

  return (
    <style scoped>
      {segment ? `p[data-segment="${segment.id}"] ~ p { font-weight: normal; }` : null}
      {item ? `span[data-item="${item.id}"] ~ span { font-weight: normal; }` : null}
    </style>
  );
};

export default Karaoke;
