import { ExamAttempt } from '@interfaces/study-path';
import { mergeFlexNowAttempts } from './exam-attempt.helper';

function attempt(overrides: Partial<ExamAttempt>): ExamAttempt {
  return {
    examId: '4711',
    name: 'schriftliche Prüfung (Klausur)',
    count: 1,
    grade: 2,
    semester: '2024w',
    status: 'passed',
    remark: '',
    flexNowImported: false,
    ...overrides,
  };
}

describe('mergeFlexNowAttempts', () => {
  it('keeps the stored history when the import brings no attempts', () => {
    const stored = [attempt({ semester: '2024w' })];

    expect(mergeFlexNowAttempts(stored, [])).toEqual(stored);
    expect(mergeFlexNowAttempts(stored, undefined)).toEqual(stored);
  });

  it('replaces previously imported attempts', () => {
    const stored = [attempt({ flexNowImported: true, grade: 5, status: 'failed' })];
    const imported = [attempt({ flexNowImported: true, grade: 2, status: 'passed' })];

    const result = mergeFlexNowAttempts(stored, imported);

    expect(result.length).toBe(1);
    expect(result[0].grade).toBe(2);
  });

  it('keeps a manual attempt that the import does not know about', () => {
    const stored = [attempt({ examId: '2', name: 'Referat', semester: '2023w' })];
    const imported = [attempt({ flexNowImported: true, examId: '1', semester: '2024w' })];

    const result = mergeFlexNowAttempts(stored, imported);

    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Referat');
    expect(result[1].flexNowImported).toBe(true);
  });

  it('drops a manual attempt that the import covers', () => {
    const stored = [attempt({ examId: '1', semester: '2024w', grade: 3 })];
    const imported = [
      attempt({ flexNowImported: true, examId: '1', semester: '2024w', grade: 2.7 }),
    ];

    const result = mergeFlexNowAttempts(stored, imported);

    expect(result.length).toBe(1);
    expect(result[0].grade).toBe(2.7);
  });
});
