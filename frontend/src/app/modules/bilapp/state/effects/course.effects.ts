import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { BilappRestService } from '../../bilapp-rest.service';
import * as BilAppCourseActions from '../actions/course.actions';
import { State as UserState } from '../../../../reducers/user.reducer';
import { CoursePlanningActions } from 'src/app/actions/study-planning.actions';

@Injectable()
export class CourseEffects {

  loadCourses$ = createEffect(() => this.actions$.pipe(
    ofType(BilAppCourseActions.loadCourses),
    switchMap( (props) =>
      this.rest.getEwsCourses(props.semester).pipe(
        map( courses => BilAppCourseActions.loadCoursesSuccess( { courses } )),
        catchError(error => of(BilAppCourseActions.loadCoursesFailure( { error } )))
      )
    ))
  );

  loadSelectedCourses$ = createEffect(() => this.actions$.pipe(
    ofType(BilAppCourseActions.loadSelectedCourses),
    withLatestFrom(this.store$),
    switchMap(() =>
      this.rest.getAllSavedCourses().pipe(
        map( courses => BilAppCourseActions.loadSelectedCoursesSuccess( { courses } )),
        catchError(error => of(BilAppCourseActions.loadSelectedCoursesFailure( { error } )))
      )
    ))
  );

  selectCourse$ = createEffect(() => 
    this.actions$.pipe(
      ofType(CoursePlanningActions.updateCoursesArrayInSemesterPlan),
      switchMap((props) => 
        [BilAppCourseActions.loadSelectedCourses()]
      )
    )
  )

  deselectCourse$ = createEffect(() => 
    this.actions$.pipe(
      ofType(CoursePlanningActions.updateCoursesArrayInSemesterPlan),
      switchMap((props) => 
        [BilAppCourseActions.loadSelectedCourses()]
      )
    )
  )

  constructor(
    private actions$: Actions,
    private store$: Store<{
      user: UserState;
    }>,
    private rest: BilappRestService
  ) {}
}
