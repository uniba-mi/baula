import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { config } from 'src/environments/config.local';
import { Evaluation, JobEvaluation, Organisation, RankedModule } from '../../../../../interfaces/evaluation';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  }),
};

@Injectable({
  providedIn: 'root'
})
export class EvaluationRestService {
  private urlBase = config.apiUrl;

  constructor(private http: HttpClient) { }

  // Call this function from admin-recs component
  initEvaluationData(): Observable<any> {
    return this.http.post<any>(`${this.urlBase}evaluation/init`, {}, httpOptions);
  }

  getEvaluationsBySpId(spId: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.urlBase}evaluation/${spId}`, httpOptions);
  }

  getJobEvaluation(spId: string, jobId: string): Observable<JobEvaluation> {
    return this.http.get<JobEvaluation>(`${this.urlBase}evaluation/${spId}/job/${jobId}`, httpOptions);
  }

  updateJobEvaluation(spId: string, jobId: string, rankedModules: RankedModule[], comment: string): Observable<JobEvaluation> {
    const requestBody = { rankedModules, comment };
    return this.http.put<any>(`${this.urlBase}evaluation/${spId}/job/${jobId}`, requestBody, httpOptions);
  }

  getOrganisationByCode(): Observable<Organisation> {
    return this.http.get<Organisation>(`${this.urlBase}evaluation/orga`, httpOptions);
  }
}
