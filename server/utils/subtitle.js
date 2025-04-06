export const splitTimeSeries = (inputList, intervalLength = 2.0) => {
  const output = [];

  inputList.forEach((interval) => {
    const { start, end, word } = interval;
    const series = [];
    let currentStart = start;

    while (currentStart < end) {
      const currentEnd = Math.min(currentStart + intervalLength, end);

      // If the remaining duration is less than the interval length, merge it with the previous interval
      if (series.length > 0 && currentEnd - currentStart < intervalLength) {
        // Merge with the previous interval
        series[series.length - 1].end = currentEnd;
      } else {
        series.push({ start: currentStart, end: currentEnd });
      }

      currentStart = currentEnd;
    }

    output.push({
      start: start,
      end: end,
      series: series,
      word: word,
    });
  });

  return output;
};
export const getSubtitleWithImageIndex = (data) => {
  let count = 0;
  const subtitleWithImageIndex = [];

  data.forEach((item) => {
    item.index = [];

    item.series.forEach((series, i) => {
      series.index = count;
      subtitleWithImageIndex.push({ ...series });
      item.index.push(count);
      count++;
    });
  });

  return subtitleWithImageIndex;
};
