export const canParse = (data, format) => {
  try {
    parse(data, format);
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
};
export const parse = (data, format) => {
  switch (format) {
    case 'google':
      const { results } = JSON.parse(data);

      return results.map(({ alternatives: [{ transcript: text, words }] }) => ({
        text,
        items: words.map(
          ({
            word: text,
            startTime: { seconds: startSeconds, nanos: startNanos = 0 },
            endTime: { seconds: endSeconds, nanos: endNanos = 0 },
          }) => ({
            text,
            start: parseInt(startSeconds, 10) + startNanos / 1e9,
            end: parseInt(endSeconds) + endNanos / 1e9,
          })
        ),
      }));
    case 'amazon':
      const {
        results: {
          transcripts,
          speaker_labels: { segments },
          items,
        },
      } = JSON.parse(data);

      return segments.map(({ start_time, end_time }) => {
        const segmentStart = parseInt(start_time, 10);
        const segmentEnd = parseInt(end_time, 10);

        const segmentItems = items
          .filter(({ start_time, end_time }) => {
            const start = parseInt(start_time, 10);
            const end = parseInt(end_time, 10);

            return segmentStart <= start && end <= segmentEnd;
          })
          .map(({ start_time, end_time, alternatives: [{ content: text }], type }) => {
            const start = parseInt(start_time, 10);
            const end = parseInt(end_time, 10);

            return { text, start, end, type };
          });

        return {
          text: segmentItems.map(({ text }) => text).join(' '),
          items: segmentItems,
        };
      });
    case 'speechmatics':
      const { speakers, words } = JSON.parse(data);

      return speakers.map(({ time, duration }) => {
        const segmentStart = parseInt(time, 10);
        const segmentEnd = segmentStart + parseInt(duration, 10);

        const items = words
          .filter(({ time, duration }) => {
            const start = parseInt(time, 10);
            const end = start + parseInt(duration, 10);

            return segmentStart <= start && end <= segmentEnd;
          })
          .map(({ time, duration, name: text }) => {
            const start = parseInt(time, 10);
            const end = start + parseInt(duration, 10);

            return { text, start, end };
          });

        return {
          text: items.map(({ text }) => text).join(' '),
          items,
        };
      });
    default:
      console.warn('format not handled', format);
      throw new Error('format not handled');
  }
};
