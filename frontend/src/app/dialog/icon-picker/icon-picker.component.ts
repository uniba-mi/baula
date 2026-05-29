import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-icon-picker',
  standalone: false,
  templateUrl: './icon-picker.component.html',
  styleUrl: './icon-picker.component.scss',
})
export class IconPickerComponent {
  icons = [
    'bi-lightbulb', 'bi-stars', 'bi-magic', 'bi-rocket', 'bi-rocket-takeoff',
    'bi-wrench', 'bi-tools', 'bi-gear', 'bi-sliders', 'bi-ui-checks',
    'bi-kanban', 'bi-list-check', 'bi-check2-circle', 'bi-patch-check', 'bi-bookmark-star',
    'bi-award', 'bi-trophy', 'bi-graph-up', 'bi-bar-chart', 'bi-pie-chart',
    'bi-lightning', 'bi-lightning-charge', 'bi-bug', 'bi-shield-check', 'bi-chat-dots',
    'bi-chat-square-text', 'bi-megaphone', 'bi-bell', 'bi-calendar-event', 'bi-clock-history',
    'bi-search', 'bi-eye', 'bi-heart', 'bi-hand-thumbs-up', 'bi-hand-thumbs-down',
    'bi-star', 'bi-star-fill', 'bi-bookmark', 'bi-flag', 'bi-pin-angle',
    'bi-person', 'bi-people', 'bi-person-check', 'bi-person-fill-check', 'bi-person-plus',
    'bi-globe', 'bi-cloud', 'bi-cloud-arrow-up', 'bi-download', 'bi-upload',
  ];

  selectedIcon: string | null = null;
  @Output() selectedIconChange = new EventEmitter<string>();

  selectIcon(icon: string) {
    this.selectedIcon = icon;
    this.selectedIconChange.emit(icon);
  }
}
