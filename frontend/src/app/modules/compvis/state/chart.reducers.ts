import { createReducer, on } from '@ngrx/store';
import { Bar, ChartSettings } from '../interfaces/chart';
import * as ChartActions from './chart.actions';
import { Competence } from '../../../../../../interfaces/competence';
import { Course } from '../../../../../../interfaces/course';
import { ModuleCourse } from '../../../../../../interfaces/module-course';

export const chartFeatureKey = 'chart';

export interface State {
  hoverBars: Bar[];
  hoverSelectBars: Bar[];
  bars: Bar[];
  selectedBar: Bar | undefined;
  settings: ChartSettings;
}

export const initialState: State = {
  hoverBars: [],
  hoverSelectBars: [],
  bars: [],
  selectedBar: undefined,
  settings: {
    unit: 'ects',
    view: 'studium',
    hoveredCourse: undefined,
  },
};

export const reducer = createReducer(
  initialState,
  on(ChartActions.changeUnit, (state, props) => {
    state.settings.unit = props.unit;
    return {
      ...state,
    };
  }),
  on(ChartActions.changeView, (state, props) => {
    state.settings.view = props.view;
    return {
      ...state,
    };
  }),
  on(ChartActions.setInitialBars, (state, props) => {
    const barsBuffer: Bar[] = [];
    const competences: Competence[] = props.competences;

    let index = 0;
    let childCompetences = [];
    for (const competence of competences) {
      childCompetences = competences.filter(
        (comp: Competence) => comp.parentId === competence.compId
      );
      if (!competence.parentId) {
        barsBuffer.push(new Bar(index, competence, childCompetences, 0));
        childCompetences = [];
        index++;
      }
    }

    return {
      ...state,
      bars: barsBuffer,
    };
  }),
  on(ChartActions.setBars, (state, props) => {
    const barsBuffer: Bar[] = [ ...state.bars ];
    const competences: Competence[] = [ ...props.competences ];
    if (props.selectedCourses.length !== 0) {
      // index count the number of upper competences
      let index = 0;
      for (const competence of competences) {
        if (!competence.parentId) {
          // sum up fulfillment over courses
          let fulfillment = 0;
          for (const course of props.selectedCourses) {
            // check view, if semester selected only consider courses that have this semester
            if (
              (props.view === 'semester' &&
                course.semester === props.semester) ||
              props.view === 'studium'
            ) {
              let competenceFulfillment = returnAggregatedFulfillment(course, barsBuffer[index].childCompetences, getMultiplicator(course, state.settings.unit, course.contributeAs))
              fulfillment += competenceFulfillment ? competenceFulfillment : 0;
            }
            // else do nothing, view === semester && semester !== course.semester
          }
          barsBuffer[index].fulfillment = fulfillment;
          index++;
        }
      }
    } else {
      // Reset BarFulfillment
      for (const bar of barsBuffer) {
        bar.fulfillment = 0;
      }
    }

    // check fill color of bars (regarding aim) -> Only check fill, if bar is not the selected bar, otherwise fill for selection will be resetted
    for (const bar of state.bars) {
      if(!state.selectedBar || bar.pos !== state.selectedBar.pos) {
        bar.checkFill();
      }
    }

    return {
      ...state,
      bars: barsBuffer,
    };
  }),
  on(ChartActions.setHoverBars, (state, props) => {
    const barsBuffer: Bar[] = [];
    if (props.course !== undefined) {
      // index count the number of upper competences
      const index = 0;
      for (const bar of state.bars) {
        //TODO: update here to fix bug, if course load is faster than fulfillment matc
        let courseFulfillment = returnAggregatedFulfillment(props.course, bar.childCompetences, getMultiplicator(props.course, state.settings.unit, props.contributesTo))
  
        barsBuffer.push(
          new Bar(
            index,
            bar.competence,
            bar.childCompetences,
            courseFulfillment
          )
        );
      }
    }

    return {
      ...state,
      hoverBars: barsBuffer,
    };
  }),
  on(ChartActions.deleteHoverBars, (state, props) => {
    return {
      ...state,
      hoverBars: [],
      hoverSelectBars: []
    };
  }),
  on(ChartActions.setHoverSelectBars, (state, props) => {
    const barsBuffer: Bar[] = [];
        if (props.course !== undefined) {
          // index count the number of upper competences
          const index = 0;
          for (const bar of state.bars ) {
            let courseFulfillment = returnAggregatedFulfillment(props.course, bar.childCompetences, getMultiplicator(props.course, state.settings.unit, props.contributesTo));
            //TODO: update here to fix bug, if course load is faster than fulfillment match
            barsBuffer.push(new Bar(index, bar.competence, bar.childCompetences,
                courseFulfillment));
          }
        }

        return {
            ...state,
            hoverSelectBars: barsBuffer
        };
  }),
  on(ChartActions.selectBar, (state, props) => {
    // if other bar is selected, switch color first
    if(state.selectedBar && state.selectedBar.pos !== props.index && state.bars[state.selectedBar.pos]) {
      state.bars[state.selectedBar.pos].fill = 'var(--ub-blue)';
    }
    // set color of selected Bar
    state.bars[props.index].fill = 'var(--ub-red)';

    return {
      ...state,
      selectedBar: state.bars[props.index]
    };
  }),
  on(ChartActions.deselectBar, (state, props) => {
    // reset color of bar
    for(const bar of state.bars) {
      bar.fill = 'var(--ub-blue)';
    }

    return {
      ...state,
      selectedBar: undefined
    };
  })
);

function returnAggregatedFulfillment(course: Course, competences: Competence[], multiplicator: number): number {
  let sum = 0;
  for(let comp of competences) {
    let fulfillment = course.competence.find(el => el.compId == comp.compId)?.fulfillment;
    if(fulfillment) { sum += multiplicator * fulfillment / 100 }
  }
  return sum;
}

function getMultiplicator(course: Course, unit: string, mcId: string): number {
  const moduleCourse = getModuleCourse(course, mcId);
  if(unit == 'ects') {
    if(moduleCourse && moduleCourse.ects) {
      return moduleCourse.ects
    } else if(course.ects) {
      return course.ects
    }
  } else if(unit == 'sws') {
    if(moduleCourse && moduleCourse.sws) {
      return moduleCourse.sws
    } else if(course.sws) {
      return course.sws
    }
  }
  return 0;
}

function getModuleCourse(course: Course, id: string): ModuleCourse | undefined {
  if(course.mCourses) {
    return course.mCourses.find(el => el.modCourse.mcId == id)?.modCourse;
  }
  return;
}
