import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'linkify',
    standalone: false
})

// prevent XSS issues with innerHTML
export class LinkifyPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    // regex to find URLs in the text
    const urlRegex = /(https?:\/\/[^\s'">]+)/g;

    // replace URLs with clickable links
    const linkedText = value.replace(urlRegex, (url) => `<a class="link" href="${url}" target="_blank">${url}</a>`);

    // mark the HTML as safe
    return this.sanitizer.bypassSecurityTrustHtml(linkedText);
  }
}
