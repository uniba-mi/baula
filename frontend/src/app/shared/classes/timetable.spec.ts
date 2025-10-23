import { Timetable } from './timetable';

describe('Timetable', () => {
  it('should create an instance', () => {
    expect(new Timetable('2023w')).toBeTruthy();
  });
});
