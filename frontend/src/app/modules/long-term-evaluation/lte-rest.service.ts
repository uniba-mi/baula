import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LongTermEvaluation } from '../../../../../interfaces/longTermEvaluation';
import { Observable } from 'rxjs';
import { config } from 'src/environments/config.local';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  }),
};

@Injectable()

export class LteRestService {
  private urlBase = config.apiUrl;
  private http = inject(HttpClient)
  
  // query to save survey result to database
  saveResult(result: LongTermEvaluation): Observable<any> {
    return this.http.post<any>(`${this.urlBase}survey/`, { result }, httpOptions);
  }

  // query to reset survey consent response
  resetConsentResponse(): Observable<string> {
    return this.http.put<string>(`${this.urlBase}survey/reset/response`, {}, httpOptions);
  }
}
