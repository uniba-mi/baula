import { createReducer, on } from '@ngrx/store';
import { Competence } from '../../../../../../../interfaces/competence';
import { Standard } from '../../interfaces/standard';
import * as StandardActions from '../actions/standard.actions';

export const standardFeatureKey = 'standard';

export interface State {
    standards: Standard[];
    otherStandards: any[];
    otherCompetences: any[];
    allStandards: Standard[];
    selectedStandard: Standard | undefined;
    standardSelected: boolean;
    selectedCompetence: Competence | undefined;
    competences: Competence[];
    fulfillment: object;
    competenceGroups: Competence[];
}

export const initialState: State = {
    standards: [],
    otherStandards: [],
    otherCompetences: [],
    allStandards: [],
    selectedStandard: {
        desc: 'Die Kultusministerkonferenz (KMK) ist ein Zusammenschluss der deutschen Bundesländer und hat unter anderem die Aufgabe, Bildungspolitik zu koordinieren. Die KMK entwickelt Rahmenrichtlinien und Empfehlungen für die Lehrerinnen- und Lehrerausbildung. Diese Standards dienen als Grundlage für die Ausgestaltung der Lehramtsstudiengänge in den verschiedenen Bundesländern. Die Kultusministerkonferenz hat in den <a href="https://www.kmk.org/themen/allgemeinbildende-schulen/lehrkraefte/lehrerbildung.html" target="_blank">„Standards für die Lehrerbildung: Bildungswissenschaften“ (Beschluss der Kultusministerkonferenz vom 16.12.2004 i. d. jew. geltenden Fssg.)</a> die Kompetenzen beschrieben, die in der Ausbildung für die Lehrämter erworben werden müssen.',
        name: "Standards der Kultusministerkonferenz",
​          stId: "KMK"
    },
    selectedCompetence: undefined,
    standardSelected: false,
    competences: [],
    fulfillment: {},
    competenceGroups: []
};

export const reducer = createReducer(
  initialState,
  on(StandardActions.loadCompetencesOfOtherStandardsSuccess, (state, props) => {
    return {
      ...state,
      otherCompetences: props.competences
    };
  }),
  on(StandardActions.loadSpecificStandard, (state, props) => {
    return {
      ...state,
      otherStandards: [props.standards]
    };
  }),
  on(StandardActions.loadCompetenceGroupsSuccess, (state, props) => {
    return {
      ...state,
      competenceGroups: props.competences
    };
  }),
  on(StandardActions.selectCompetence, (state, props) => {
    return {
      ... state,
      selectedCompetence: props.competence,
    };
  }),
  on(StandardActions.deselectCompetence, (state, props) => {
    return {
      ... state,
      selectedCompetence: undefined,
    };
  }),
  on(StandardActions.loadSpecificStandardSuccess, (state, props) => {
    return {
      ...state,
      otherStandards: [props.standard]
    };
  }),
  on(StandardActions.loadStandardSuccess, (state, props) => {
    return {
      ...state,
      standards: props.standards
    };
  }),
  on(StandardActions.selectStandard, (state, props) => {
    return {
      ...state,
      selectedStandard: props.standard,
      standardSelected: true
    };
  }),
  on(StandardActions.updateCompetencesSuccess, (state, props) => {
    return {
      ...state,
      competences: props.competences
    };
  }),
  on(StandardActions.loadFulfillmentSuccess, (state, props) => {
    const selectedCourseFulfillment: any = {};

    if (props.courses.length !== 0) {
        // create initial fulfillmentObject with value 0 for each competence
        state.competences.forEach( (comp) => {
            selectedCourseFulfillment[comp.compId] = 0;
        });

        for (const course of props.courses) {
            for (const competenceID of Object.keys(course.course_fulfillment)) {
                selectedCourseFulfillment[competenceID] += course.course_fulfillment[competenceID];
            }
        }
    }

    return {
        ...state,
        fulfillment: selectedCourseFulfillment
    };
  }),
)
