import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Competence } from '../../../../../interfaces/competence';
import { ModuleAcronym } from '../../../../../interfaces/module';
import { Standard } from '../bilapp/interfaces/standard';
import { BilAppCourseShort, BilAppCourse } from './interfaces/bilapp';
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
export class PublicRestService {
  private urlBase = config.apiUrl + 'bilapp/'

  constructor(private http: HttpClient) { }
  
  getModules(): Observable<ModuleAcronym[]> {
    return this.http.get<ModuleAcronym[]>(`${this.urlBase}modules`, httpOptions);
  }

  getCompetences(): Observable<Competence[]> {
    return this.http.get<Competence[]>(`${this.urlBase}competences/children/uppest`, httpOptions);
  }

  getStandards(): Observable<Standard[]> {
    return this.http.get<Standard[]>(`${this.urlBase}standards`, httpOptions);
  }

  // get existing courses from BilApp
  getBilAppCourses(semester: string): Observable<BilAppCourseShort[]> {
    return this.http.get<BilAppCourseShort[]>(`${this.urlBase}courses/${semester}`, httpOptions)
  }

  // get competence and module connection from BilApp-Course
  getCompetenceAndModuleFromCourse(id: string): Observable<BilAppCourse> {
    return this.http.get<BilAppCourse>(`${this.urlBase}course/${id}`, httpOptions)
  }
  
}
