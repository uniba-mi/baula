import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { SearchSettings, Option } from "../../../../interfaces/search";

export const SearchActions = createActionGroup({
    source: 'Search',
    events: {
        'Reset search settings': props<{ context: string }>(),
        'Update search settings': props<{ context: string, searchSettings: SearchSettings }>(),
        'Add filter option': props<{ context: string, option: Option }>(),
        'Delete filter option': props<{ context: string, key: string }>(),
        'Update grouping option': props<{ context: string, grouping: string }>(),
    }
})