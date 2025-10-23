import { createReducer, on } from '@ngrx/store';
import { SearchSettings } from '../../../../interfaces/search';
import { SearchActions } from '../actions/search-settings.actions';

export const searchSettingsFeatureKey = 'search-settings';

export interface State {
  searchContexts: { [contextKey: string]: SearchSettings };
}

export const initialState: State = {
  searchContexts: {
    'module-overview': {
      term: '',
      searchIn: [],
      filter: [],
      selectedGrouping: '',
    },
    'course-search': {
      term: '',
      searchIn: [],
      filter: [],
    },
    'recs-search': {
      term: '',
      searchIn: [],
      filter: [],
    },
    'personalisation-search': {
      term: '', // currently not used
      filter: [],
      searchIn: [], // currently not used
    }
  }
};

export const reducer = createReducer(
  initialState,

  on(SearchActions.updateSearchSettings, (state, props) => {
    const currentContext = state.searchContexts[props.context];
    if (props.context !== 'module-overview') { // for all contexts except module-overview
      return {
        ...state,
        searchContexts: {
          ...state.searchContexts,
          [props.context]: {
            ...currentContext,
            ...props.searchSettings
          }
        }
      }


    } else { // for module-overview
      // before update of searchsettings check if filters are already set!
      let updatedFilter = props.searchSettings.filter || [];
      // case 1: no filter set -> take props
      // case 2: filter set -> combine filter set with props
      if (currentContext.filter && currentContext.filter.length > 0) {
        const existingFilters = currentContext.filter.filter(el => el.key == 'mgId' || el.key == 'chair')
        if (props.searchSettings.filter) {
          updatedFilter = props.searchSettings.filter.concat(existingFilters)
        } else {
          updatedFilter = existingFilters;
        }
      }

      return {
        ...state,
        searchContexts: {
          ...state.searchContexts,
          [props.context]: {
            ...props.searchSettings,
            filter: updatedFilter,
            selectedGrouping: currentContext.selectedGrouping // preserve grouping
          }
        }
      }
    }
  }),

  on(SearchActions.resetSearchSettings, (state, props) => {
    return {
      ...state,
      searchContexts: {
        ...state.searchContexts,
        [props.context]: {
          ...state.searchContexts[props.context],
          term: '',
          searchIn: [],
          filter: []
        }
      }
    }
  }),

  on(SearchActions.addFilterOption, (state, props) => {
    const currentContext = state.searchContexts[props.context];
    let updatedFilter = [...(currentContext.filter || []), props.option];

    return {
      ...state,
      searchContexts: {
        ...state.searchContexts,
        [props.context]: {
          ...currentContext,
          filter: updatedFilter
        }
      }
    }
  }),

  on(SearchActions.deleteFilterOption, (state, props) => {
    const currentContext = state.searchContexts[props.context];
    const updatedFilter = (currentContext.filter || []).filter(el => el.key !== props.key);

    return {
      ...state,
      searchContexts: {
        ...state.searchContexts,
        [props.context]: {
          ...currentContext,
          filter: updatedFilter
        }
      }
    }
  }),

  on(SearchActions.updateGroupingOption, (state, props) => {

    const currentContext = state.searchContexts[props.context];

    return {
      ...state,
      searchContexts: {
        ...state.searchContexts,
        [props.context]: {
          ...currentContext,
          selectedGrouping: props.grouping
        }
      }
    }
  }),

);