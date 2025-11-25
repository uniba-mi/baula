import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { config } from 'src/environments/config.local';
import { AcademicDateTemplate, AcademicDate, DateType } from '../../../../../interfaces/academic-date';
import { Logmessage } from '../../../../../interfaces/logs';
import { ModuleCourse2CourseConnection } from '../../../../../interfaces/connection';
import { AdminReport } from './reporting';

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
export class AdminRestService {
  private urlBase = config.apiUrl + 'baula/admin';


  constructor(private http: HttpClient) { }

  crawlFlexNow(semester: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.urlBase}/crawling/fnmhbs/${semester}`, httpOptions);
  };

  crawlUnivIS(semester: string): Observable<string[]> {
    return this.http.post<string[]>(
      `${this.urlBase}/crawling/univis`,
      { semester },
      httpOptions
    );
  }

  initConnectionCourses2Modules(): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.urlBase}/connection`,
      httpOptions
    );
  }

  createConnectionCourse2Module(mcId: string, cId: string, semester: string): Observable<string> {
    return this.http.post<string>(`${this.urlBase}/connection`, {
      mcId, 
      cId,
      semester
    }, httpOptions)
  }

  deleteConnectionCourse2Module(mcId: string, cId: string, semester: string): Observable<string> {
    return this.http.delete<string>(`${this.urlBase}/connection/${mcId}/${cId}/${semester}`, httpOptions)
  }

  /* --------------------------------
  ------ Queries for admin area -----
  ----------------------------------- */
  getAllAcademicDates(): Observable<AcademicDate[]> {
    return this.http.get<AcademicDate[]>(`${this.urlBase}/academic-dates`, httpOptions)
  }

  addAcademicDate(date: AcademicDateTemplate): Observable<AcademicDate> {
    const body = {
      startdate: date.startdate,
      enddate: date.enddate,
      starttime: date.starttime,
      endtime: date.endtime,
      desc: date.desc,
      semester: date.semester,
      datetypeId: date.dateType.typeId
    }
    return this.http.post<AcademicDate>(`${this.urlBase}/academic-date`, body, httpOptions)
  }

  updateAcademicDate(date: AcademicDate): Observable<AcademicDate> {
    const body = {
      id: date.id,
      startdate: date.startdate,
      enddate: date.enddate,
      starttime: date.starttime,
      endtime: date.endtime,
      desc: date.desc,
      semester: date.semester,
      datetypeId: date.dateType.typeId
    }
    return this.http.put<AcademicDate>(`${this.urlBase}/academic-date`, body, httpOptions)
  }

  deleteAcademicDate(id: number): Observable<AcademicDate> {
    return this.http.delete<AcademicDate>(`${this.urlBase}/academic-date/${id}`, httpOptions)
  }

  addDateType(name: string, desc: string): Observable<DateType> {
    return this.http.post<DateType>(`${this.urlBase}/date-type`, {
      name, 
      desc
    }, httpOptions)
  }

  updateDateType(dateType: DateType): Observable<DateType> {
    return this.http.put<DateType>(`${this.urlBase}/date-type`, {
      id: dateType.typeId,
      name: dateType.name,
      desc: dateType.desc
    }, httpOptions)
  }

  deleteDateType(id: number): Observable<DateType> {
    return this.http.delete<DateType>(`${this.urlBase}/date-type/${id}`, httpOptions)
  }

  getCronjobLog(): Observable<Logmessage[]> {
    return this.http.get<Logmessage[]>(`${this.urlBase}/logs/cronjob`, httpOptions)
  }

  getErrorLogs(): Observable<Logmessage[]> {
    return this.http.get<Logmessage[]>(`${this.urlBase}/logs/error`, httpOptions)
  } 

  getConnectedCoursesForModule(id: string, version: number, semester: string): Observable<ModuleCourse2CourseConnection[]> {
    return this.http.get<ModuleCourse2CourseConnection[]>(`${this.urlBase}/connections/${id}/${version}/${semester}`, httpOptions)
  }

  /* --------------------------------
  -- Queries for Creation of MHBs ---
  -----------------------------------*/
  postXmlMhbsToDatabase(xmltext: string): Observable<any> {
    const requestBody = { xmltext };
    return this.http.post<any>(
      this.urlBase + '/fnmhb',
      requestBody,
      httpOptions
    );
  }

  /* --------------------------------
  -- Queries for Creating/Updating of Topics/Embeddings ---
  -----------------------------------*/
  updateModuleEmbeddings(): Observable<[]> {
    return this.http.post<[]>(
      `${this.urlBase}/embeddings/modules`,
      {},
      httpOptions
    );
  }

  initializeTopics(): Observable<[]> {
    return this.http.post<[]>(
      `${this.urlBase}/topics/initialize`,
      {},
      httpOptions
    );
  }

  // Query for Report
  getReport(): Observable<AdminReport> {
    return this.http.get<AdminReport>(`${this.urlBase}/report`, httpOptions);
  }

  // Hint reset
  resetNotificationHint(): Observable<string> {
    return this.http.put<string>(`${this.urlBase}/reset-hint`, {}, httpOptions)
  }
}