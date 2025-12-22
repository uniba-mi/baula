import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { config } from 'src/environments/config.local';
import { Recommendation } from '../../../../../interfaces/recommendation';
import { Topic, TopicTree } from '../../../../../interfaces/topic';
import { ModuleFeedback } from '../../../../../interfaces/user';
import { ExtendedJob, Jobtemplate } from '../../../../../interfaces/job';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  }),
};

@Injectable({
  providedIn: 'root'
})
export class RecsRestService {
  private urlBase = config.apiUrl + 'baula/';

  constructor(private http: HttpClient) { }

  /* ----------------------------------------------------------------------
  * further recommendations
  -------------------------------------------------------------------------*/

  /** get topic tree from the database (user-independent)
  @returns an array of topics */
  getTopicTree(): Observable<TopicTree> {
    return this.http.get<TopicTree>(
      `${this.urlBase}topics/tree`, httpOptions
    );
  }

  /** get children topics from the database (user-independent)
  @returns an array of children topics */
  getTopicChildren(): Observable<Topic[]> {
    return this.http.get<Topic[]>(
      `${this.urlBase}topics/children`, httpOptions
    );
  }

  /** 
   * creates a recommendation based on user topics.
   * @param tIds - array of topic IDs.
   * @returns observable of recommendation.
   */
  createTopicRecommendation(tIds: string[]): Observable<Recommendation> {
    return this.http.post<Recommendation>(
      `${this.urlBase}topics/recommendation`, { tIds }, httpOptions
    );
  }

  /** 
 * Retrieves the current personal recommendation snapshot from the Recommendation table for a user.
 * @returns observable of recommendation.
 */
  getPersonalRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(
      `${this.urlBase}recommendations/`,
      httpOptions
    );
  }

  /**
 * Updates or creates personal recommendations based on user feedback.
 * @returns observable of updated recommendation.
 */
  updatePersonalRecommendations(moduleFeedback: ModuleFeedback): Observable<Recommendation> {
    return this.http.put<Recommendation>(
      `${this.urlBase}feedback`,
      { moduleFeedback },
      httpOptions
    );
  }

  /**
 * Deletes feedback source from personal recommendations based on deleted user feedback.
 * @returns observable of updated recommendation.
 */
  deletePersonalRecommendationsByFeedback(acronym: string): Observable<Recommendation> {
    return this.http.delete<Recommendation>(
      `${this.urlBase}feedback/${acronym}`,
      httpOptions
    );
  }

  /** --------------------------------------------
     * Queries for the job recommendation
     *  -------------------------------------------- */
  crawlJob(url: string): Observable<Jobtemplate> {
    return this.http.post<Jobtemplate>(
      `${this.urlBase}jobs/crawling`,
      { url },
      httpOptions
    );
  }

  generateJobKeywords(job: Jobtemplate): Observable<Jobtemplate> {
    return this.http.post<Jobtemplate>(
      `${this.urlBase}jobs/keywords`,
      job,
      httpOptions
    );
  }

  recommendModulesToJob(
    job: Jobtemplate,
    jobId?: string
  ): Observable<ExtendedJob> {
    return this.http.post<ExtendedJob>(
      `${this.urlBase}jobs/recommendation`,
      { job, jobId },
      httpOptions
    );
  }
}