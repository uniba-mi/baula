import { MarkdownPipe } from './mark-down.pipe';

describe('MarkdownPipe', () => {
  it('create an instance', () => {
    const pipe = new MarkdownPipe();
    expect(pipe).toBeTruthy();
  });
});
