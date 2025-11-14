import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlanningHints } from '../../../../../../interfaces/semester-plan';

@Component({
  selector: 'app-hints-sidenav',
  standalone: false,
  templateUrl: './hints-sidenav.component.html',
  styleUrl: './hints-sidenav.component.scss'
})

export class HintsSidenavComponent {
  @Input() hints: PlanningHints[] = [];
  @Input() opened: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() acronymClick = new EventEmitter<string>();
  @Output() resolveCollision = new EventEmitter<PlanningHints>();

  onClose(): void {
    this.close.emit();
  }

  onAcronymClick(acronym: string): void {
    this.acronymClick.emit(acronym);
  }

  onResolveClick(hint: PlanningHints): void {
    this.resolveCollision.emit(hint);
  }
}
