import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExpandedCourse, Course } from '../../../../../interfaces/course';
import { Competence } from '../../../../../interfaces/competence';
import { Standard } from './interfaces/standard';
import { config } from 'src/environments/config.local';

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
export class BilappRestService {
  private urlBase = config.apiUrl + 'bilapp/';
  
  constructor(private http: HttpClient) { }

  /* -----------------------
   * Queries for Standards
  --------------------------*/
  /** get all standards in the database
   * @returns Observable with type array of Standards */
  getStandards(): Observable<Standard[]> {
    return this.http.get<Standard[]>(this.urlBase + 'standards', httpOptions);
  }

  /** get one specific standard via standard_id
   * @param standardID id of requested standard
   * @returns Observable with type standard
   */
  getStandard(standardID: string): Observable<Standard> {
    return this.http.get<Standard>(this.urlBase + 'standard/' + standardID, httpOptions);
  }

  /* -----------------------
   * Queries for Competences
  ---------------------------*/
  /** get all competences in database
   * @returns Observable with type array of competences */
  getAllCompetences(): Observable<Competence[]> {
    return this.http.get<Competence[]>(this.urlBase + 'competences/all', httpOptions);
  }

  /** get all competences (all levels) from a specific standard
   * @param standardID id of standard for that all competences are requested
   * @returns Observable with type array of competences */
  getCompetences(standardID: string): Observable<Competence[]> {
    return this.http.get<Competence[]>(this.urlBase + 'competences/all/' + standardID, httpOptions);
  }

  /** Get Competences where groupID is not empty --> all competences except the uppest
   * @returns Observable with type array of competences, all competences except the uppest */
  getCompetencesWithGroupID(): Observable<Competence[]> {
    return this.http.get<Competence[]>(this.urlBase + 'competences/children/uppest', httpOptions);
  }

  /** Get Competences where groupID is empty --> all upper competences of all standards 
   * @returns Observable with type array of competences, all upper competences */
  getCompetencesWithNoGroupID(): Observable<Competence[]> {
    return this.http.get<Competence[]>(this.urlBase + 'competences/uppest', httpOptions);
  }

  /** get all competences of one standardid where groupID is empty  --> all upper competences of one standard
   * @param standardID id of standard for that the upper competences are requested
   * @returns Observable with type array of competences, all upper competences of requested standard */
  getCompetencesFromStandard(standardID: string): Observable<Competence[]> {
    return this.http.get<Competence[]>(this.urlBase + 'competences/uppest/' + standardID, httpOptions);
  }

  /** get competences that have the same competenceGroupID (childs of the parentcompetence)  
   * @param competenceGroupID id of competence, thats children are requested
   * @returns Observable with type array of competences, all children from requested competence */
  getCompetencesFromGroupID(competenceGroupID: string): Observable<Competence[]> {
    return this.http.get<Competence[]>(this.urlBase + 'competences/children/uppest/' + competenceGroupID, httpOptions);
  }

  getEwsCourses(semester: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.urlBase}courses/${semester}/LAMOD-01`, httpOptions);
  }

  getTop5CoursesForCompetence(semester: string, competence: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.urlBase}courses/${semester}/${competence}/5`, httpOptions);
  }

  getAllSavedCourses(): Observable<ExpandedCourse[]> {
    return this.http.get<ExpandedCourse[]>(`${this.urlBase}courses`, httpOptions);
  }
}
