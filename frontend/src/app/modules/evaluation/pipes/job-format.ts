import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'jobFormat',
  standalone: false
})
export class JobFormatPipe implements PipeTransform {
  transform(desc: string): string {
    if (!desc) return '';

    const lines = desc.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let html = '';
    let inList = false;

    for (let line of lines) {
      // markdown headers
      if (line.startsWith('#')) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        const headerLevel = this.getHeaderLevel(line);
        const headerText = line.replace(/^#+\s*/, '');
        const processedHeader = this.processBoldText(headerText);
        html += `<h${headerLevel} class="job-markdown-header">${processedHeader}</h${headerLevel}>`;
      }
      // bullet points (* or -) BUT check if it's bold text first
      else if (this.isBulletPoint(line)) {
        if (!inList) {
          html += '<ul class="job-list">';
          inList = true;
        }
        const bulletContent = line.substring(1).trim();
        const formattedContent = this.processBoldText(bulletContent);
        html += `<li>${formattedContent}</li>`;
      }
      else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }

        const processedLine = this.processBoldText(line);

        if (this.isHeader(line)) {
          html += `<h4 class="job-section-header">${processedLine}</h4>`;
        } else {
          html += `<p class="job-paragraph">${processedLine}</p>`;
        }
      }
    }

    if (inList) {
      html += '</ul>';
    }

    return html;
  }

  private isBulletPoint(line: string): boolean {
    if (!line.startsWith('*') && !line.startsWith('-')) {
      return false;
    }

    if (line.startsWith('*')) {
      const afterFirstStar = line.substring(1).trim();
      if (afterFirstStar.startsWith('*') || line.includes('**')) {
        return false; // bold text, no bullet
      }
    }

    return true; // bullet
  }

  private getHeaderLevel(line: string): number {
    const match = line.match(/^#+/);
    return match ? Math.min(match[0].length, 6) : 1;
  }

  private processBoldText(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  private isHeader(line: string): boolean {
    return line.endsWith(':') ||
      line.includes('Aufgaben:') ||
      line.includes('Qualifikationen:') ||
      line.includes('Profil') ||
      line.includes('Aufgabengebiet') ||
      line.includes('Perspektiven') ||
      line.includes('Vorteile') ||
      line.includes('Beginn nach Absprache') ||
      line.includes('Wir suchen') ||
      line.includes('Deine Aufgaben');
  }
}