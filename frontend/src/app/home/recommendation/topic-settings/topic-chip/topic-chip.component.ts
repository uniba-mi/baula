import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { getUserTopics } from 'src/app/selectors/user.selectors';
import { UserActions } from 'src/app/actions/user.actions';
import { Topic } from '../../../../../../../interfaces/topic';

@Component({
  selector: 'app-topic-chip',
  templateUrl: './topic-chip.component.html',
  styleUrls: ['./topic-chip.component.scss'],
  standalone: false,
})
export class TopicChipComponent implements OnInit {
  @Input() topic: Topic;
  @Output() topicToggled = new EventEmitter<string>();

  private currentUserTopics: string[] = [];

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.select(getUserTopics).subscribe(topics => {
      this.currentUserTopics = topics || [];
    });
  }

  isSelected(tId: string): boolean {
    return this.currentUserTopics.includes(tId);
  }

  toggleTopic(tId: string): void {
    this.store.dispatch(UserActions.toggleTopic({ topic: tId }));
    this.topicToggled.emit(tId);
  }
}