type TimeProps = {
  second?: number;
  minute?: number;
  hour?: number;
  day?: number;
  week?: number;
  month?: number;
  year?: number;
};

const MS = {
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
  week: 1000 * 60 * 60 * 24 * 7,
  month: 1000 * 60 * 60 * 24 * 30,
  year: 1000 * 60 * 60 * 24 * 30 * 12,
};

export const timeInMs = ({ second = 0, minute = 0, hour = 0, day = 0, week = 0, month = 0, year = 0 }: TimeProps) => {
  return (
    second * MS.second +
    minute * MS.minute +
    hour * MS.hour +
    day * MS.day +
    week * MS.week +
    month * MS.month +
    year * MS.year
  );
};

export const timeInSec = (props: TimeProps) => timeInMs(props) / 1000;
