import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, firstValueFrom } from 'rxjs';
import { BilappRestService } from 'src/app/modules/bilapp/bilapp-rest.service';
import { CourseList } from 'src/app/modules/bilapp/interfaces/course-list';
import { getCompetenceGroups } from '../../../../state/selectors/standard.selectors';
import { State } from 'src/app/reducers';
import { Course } from '../../../../../../../../../interfaces/course';
import { Standard } from '../../../../interfaces/standard';
import { loadCompetenceGroups } from '../../../../state/actions/standard.actions';
import { Competence } from '../../../../../../../../../interfaces/competence';
import { getActiveSemester } from 'src/app/selectors/study-planning.selectors';

@Component({
    selector: 'app-recommendations',
    templateUrl: './recommendations.component.html',
    styleUrls: ['./recommendations.component.scss'],
    standalone: false
})
export class RecommendationsComponent implements OnInit, OnChanges {
  @Input() selectedStandard: Standard | undefined | null;
  @Input() courses: Course[] | null;

  selectedSemester:string;
  currentUnit: string;

  //Properties that can not be recieved from the parent component
  structure: CourseList[];
  
  competenceGroups$: Observable<Competence[]>;
  //recommendedCourses$: Observable<CompetenceFulfillment[]>;
  selectedSemester$: Observable<string>;
  currentUnit$: Observable<string>;
  
 
  constructor(private store: Store<State>, private rest: BilappRestService) { }

  ngOnInit() {
    this.structure = [];
    this.competenceGroups$ = this.store.pipe(select(getCompetenceGroups));
    this.selectedSemester$ = this.store.pipe(select(getActiveSemester));
    //this.currentUnit$ = this.store.pipe(select(getUnit));
    // Just for test reasons
    this.currentUnit = 'ects'


    // subscribe to current values
    this.selectedSemester$.subscribe(semester => {
      this.selectedSemester = semester;
        /* this.store.dispatch(new LoadCourses({
          semester
        })); */
    });

    /* this.currentUnit$.subscribe(unit => {
      this.currentUnit = unit;
      // initiate update of courses when unit is changed
      if(this.selectedStandard) {
        this.store.dispatch(new LoadCompetenceGroups({standardID: this.selectedStandard.standards_id }));
      }
    }) */
    
    this.competenceGroups$.subscribe(competences => {
      // filter competences to limit processing on competences of selected standard
      let currentCompetences: Competence[] = competences.filter(comp => this.selectedStandard && comp.stId == this.selectedStandard.stId);
      if(this.courses && currentCompetences.length !== 0 && this.courses.length !== 0 && this.selectedSemester !== undefined && this.currentUnit !== undefined) {
        // this is important to hand over structure to course list component
        this.structure = this.createStructureForCourselist(currentCompetences);
      }
    });
  }

  //Angular LifeCycle hook that executes everytime a @Input() annotaded field changes
  //Currently to enable change of structure, when standard or courses changes
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.selectedStandard && this.selectedStandard) {
      this.store.dispatch(loadCompetenceGroups({standardID: changes.selectedStandard.currentValue.stId }));
    }
    if(changes.courses && this.selectedStandard) {
      this.store.dispatch(loadCompetenceGroups({standardID: this.selectedStandard.stId }));
    }
  }

  /* 
  creates the structure for the courselist that is binded to the courselist and visualizes the structure. 
  Takes the currentCompetences and loops over them and get the top 5 courses for each competence and adds them to the structure
  */
  createStructureForCourselist(currentCompetences: Competence[]): CourseList[] {
    let newStructure: CourseList[] = [];

    for(const comp of currentCompetences) {
      // selectedSemester are checked before
      // limitation: currently only percental order is checked without integrating unit
      firstValueFrom(this.rest.getTop5CoursesForCompetence(this.selectedSemester, comp.compId)).then( (courses: Course[]) =>{
        newStructure.push(new CourseList(comp.compId, comp.short, courses));
      })
    }
    return newStructure;
  }
}
