import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { State } from 'src/app/reducers';
import { config } from 'src/environments/config.local';
import { ModulePasses, Recommendation } from '../../../../../interfaces/recommendation';
import { Topic, TopicTree } from '../../../../../interfaces/topic';
import { ModuleFeedback } from '../../../../../interfaces/user';

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
  private urlBase = config.apiUrl;

  constructor(private http: HttpClient, private store: Store<State>) { }


  /** are there cohort recommendations for spId?
   * @param spId id of current studyprogram
   * @returns Observable of type boolean
   */
  getCohortRecsAvailabilityInfo(spId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.urlBase}recs/${spId}/cohort-recs-available`,
      httpOptions
    );
  }

  /* --------------------------------------------
   * Recommendations related to a specific module
  ----------------------------------------------*/

  /** get the semester in which the module is passed on average for students studying a specific program
   * @param spId id of current studyprogram
   * @param modAcr module acronym
   * @returns Observable of type number
   */
  getAvgRecSemester(spId: string, modAcr: string): Observable<number> {
    return this.http.get<number>(
      `${this.urlBase}recs/${spId}/${modAcr}/semester/avg`,
      httpOptions
    );
  }

  /** get the semester in which the module is passed on average for students studying a specific program who are good in the specific module
 * @param spId id of current studyprogram
 * @param modAcr module acronym
 * @returns Observable with type number
 */
  getSucRecSemester(spId: string, modAcr: string): Observable<number> {
    return this.http.get<number>(
      `${this.urlBase}recs/${spId}/${modAcr}/semester/suc`,
      httpOptions
    );
  }

  /** get the modules chosen after the specific module for students studying a specific program
   * @param spId id of current studyprogram
   * @param modAcr module acronym
   * @returns an array of ModulePasses (modules and the frequency of passes)
   */
  getSuccessors(spId: string, modAcr: string): Observable<ModulePasses[]> {
    return this.http.get<ModulePasses[]>(
      `${this.urlBase}recs/${spId}/${modAcr}/successors`,
      httpOptions
    );
  }

  /** get the modules chosen after the specific module for students studying a specific program
   * @param spId id of current studyprogram
   * @param modAcr module acronym
   * @param n number of results
   * @returns an array of top n ModulePasses (modules and the frequency of passes)
   */
  getTopNSuccessors(spId: string, modAcr: string, n: number): Observable<ModulePasses[]> {
    return this.http.get<ModulePasses[]>(
      `${this.urlBase}recs/${spId}/${modAcr}/top${n}/successors`,
      httpOptions
    );
  }

  /** get the most frequent modules chosen before the specific module for students studying a specific program
   * @param spId id of current studyprogram
   * @param modAcr module acronym
   * @returns an array of precursors (modules and the frequency of passes)
   */
  getPrecursors(spId: string, modAcr: string): Observable<ModulePasses[]> {
    return this.http.get<ModulePasses[]>(
      `${this.urlBase}recs/${spId}/${modAcr}/successors`,
      httpOptions
    );
  }

  /* ----------------------------------------------------------------------
   * Study program specific recommendations not relating to specific module
  -------------------------------------------------------------------------*/

  /** get commonly passed modules for students studying a specific program
 * @param spId id of current studyprogram
 * @returns an array of common passes (modules and the frequency of passes)
 */
  getCommonPasses(spId: string): Observable<ModulePasses[]> {
    return this.http.get<ModulePasses[]>(
      `${this.urlBase}recs/${spId}/common-passes`,
      httpOptions
    );
  }

  /** get the most frequently chosen modules after the specific module for students studying a specific program
   * @param spId id of current studyprogram
   * @param modAcr module acronym
   * @param n number of results
   * @returns an array of top n common passes (modules and the frequency of passes)
   */
  getTopNCommonPasses(spId: string, n: number): Observable<ModulePasses[]> {
    return this.http.get<ModulePasses[]>(
      `${this.urlBase}recs/${spId}/top${n}/common-passes`,
      httpOptions
    );
  }

  /** get the less frequently chosen modules after the specific module for students studying a specific program
   * @param spId id of current studyprogram
   * @param modAcr module acronym
   * @param n number of results
   * @returns an array of bottom n common passes (modules and the frequency of passes)
   */
  getBottomNCommonPasses(spId: string, n: number): Observable<ModulePasses[]> {
    return this.http.get<ModulePasses[]>(
      `${this.urlBase}recs/${spId}/bottom${n}/commonPasses`,
      httpOptions
    );
  }

  /* ----------------------------------------------------------------------
  * further recommendations
  -------------------------------------------------------------------------*/

  /** get topic tree from the database (user-independent)
  @returns an array of topics */
  getTopicTree(): Observable<TopicTree> {
    return this.http.get<TopicTree>(
      `${this.urlBase}recs/topic/tree`, httpOptions
    );
  }

  /** get children topics from the database (user-independent)
  @returns an array of children topics */
  getTopicChildren(): Observable<Topic[]> {
    return this.http.get<Topic[]>(
      `${this.urlBase}recs/topic/children`, httpOptions
    );
  }

  /** 
   * creates a recommendation based on user topics.
   * @param tIds - array of topic IDs.
   * @returns observable of recommendation.
   */
  createTopicRecommendation(tIds: string[]): Observable<Recommendation> {
    return this.http.post<Recommendation>(
      `${this.urlBase}recs/topic/recommendation`, { tIds }, httpOptions
    );
  }

  /** 
 * Retrieves the current personal recommendation snapshot from the Recommendation table for a user.
 * @returns observable of recommendation.
 */
  getPersonalRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(
      `${this.urlBase}recs/personal`,
      httpOptions
    );
  }

  /**
 * Updates or creates personal recommendations based on user feedback.
 * @returns observable of updated recommendation.
 */
  updatePersonalRecommendations(moduleFeedback: ModuleFeedback): Observable<Recommendation> {
    return this.http.put<Recommendation>(
      `${this.urlBase}recs/personal`,
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
      `${this.urlBase}recs/personal/feedback/${acronym}`,
      httpOptions
    );
  }
}