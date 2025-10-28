import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-word-cloud',
  standalone: false,
  templateUrl: './word-cloud.component.html',
  styleUrl: './word-cloud.component.scss'
})
export class WordCloudComponent {
  @Input() words: string[] = [];
  @Input() title?: string;
  @Input() theme: 'jobs' | 'topics' | 'default' = 'default';
  @Input() clickable: boolean = false; // set to true if words should be clickable
  @Output() clicked = new EventEmitter<string>();

  processedWords: any[] = [];

  private palettes: Record<string, string[]> = {
    jobs: ['#5c6bc0', '#7986cb', '#9fa8da', '#d6ddfa'],
    topics: ['#1976d2', '#2196f3', '#64b5f6', '#bbdefb'],
    default: ['#1e88e5', '#43a047', '#f4511e', '#6d4c41']
  };

  ngOnInit() {
    this.updateProcessedWords();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['words'] || changes['theme']) {
      this.updateProcessedWords();
    }
  }

  private updateProcessedWords() {
    if (!this.words || this.words.length === 0) {
      this.processedWords = [];
      return;
    }

    const counts = this.words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const max = Math.max(...Object.values(counts));
    const palette = this.palettes[this.theme] || this.palettes.default;

    const wordCount = Object.keys(counts).length;
    let baseSize = 1.0;
    if (wordCount < 10) baseSize = 1.5;
    if (wordCount > 20) baseSize = 0.9;

    this.processedWords = Object.entries(counts).map(([text, count], index) => ({
      text,
      size: baseSize * (0.6 + (count / max) * 0.5),
      color: palette[index % palette.length]
    }));
  }

  onClicked(word: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.clickable) {
      this.clicked.emit(word);
    }
  }
}

