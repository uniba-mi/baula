import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListType } from '../../interfaces/list-types';
import { Topic } from '../../../../../../../interfaces/topic';
import { Job } from '../../../../../../../interfaces/job';
import { ModuleWithMetadata } from '../../../../../../../interfaces/recommendation';
import { Module } from '../../../../../../../interfaces/module';

@Component({
  selector: 'app-recs-module-list',
  standalone: false,
  templateUrl: './recs-module-list.component.html',
  styleUrl: './recs-module-list.component.scss'
})
export class RecsModuleListComponent {
  @Input() modules: (Module | ModuleWithMetadata)[] | null = [];
  @Input() listType: ListType;
  @Input() droppedModules: Set<string> = new Set();
  @Input() allJobs: Job[] = [];
  @Input() allTopics: Topic[] = [];
  @Input() isDragDisabled: boolean = false;
  @Input() noDataMessage: string = "Keine Vorschläge vorhanden.";
  @Input() showClearButton: boolean = false;
  @Output() moduleFavouriteToggled = new EventEmitter<string>();
  @Output() clearList = new EventEmitter<void>();

  onToggleFavourite(acronym: string): void {
    this.moduleFavouriteToggled.emit(acronym);
  }

  onClearList(): void {
    this.clearList.emit();
  }
}