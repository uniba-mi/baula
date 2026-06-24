import { Component, OnInit, inject } from '@angular/core';
import { AdminRestService } from '../admin-rest.service';
import { Logmessage } from '../../../../../../interfaces/logs';
import { Observable } from 'rxjs';

@Component({
  selector: 'admin-error-logs',
  templateUrl: './error-logs.component.html',
  styleUrl: './error-logs.component.scss',
  standalone: false,
})
export class ErrorLogsComponent implements OnInit {
  private rest = inject(AdminRestService);

  errorLogs$: Observable<Logmessage[]>;

  ngOnInit(): void {
    this.errorLogs$ = this.rest.getErrorLogs();
  }
}
