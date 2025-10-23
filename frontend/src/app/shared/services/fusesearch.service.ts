import { Injectable } from '@angular/core';
import Fuse from 'fuse.js';

@Injectable({
  providedIn: 'root',
})
export class FuseSearchService {

  options = {
    keys: [''],
    threshold: 0.4,
    findAllMatches: true,
    isCaseSensitive: false,
    includeScore: false,
    shouldSort: true,
    ignoreLocation: true,
  };

  constructor() {}

  // searches data to be searched with options
  search(data: any, term: string, searchIn: string[], acronyms?: string[], threshold?: number): any {
    let fittingAcronyms = undefined
    let fuseAcronym = undefined
    let optionsAcronym = { ...this.options }
    const searchTerm = term.trim();

    // set settings for generic search
    if (searchIn) {
      this.options.keys = searchIn;
    }
    this.options.threshold = threshold ? threshold : 0.4;

    // check if acronyms are passed and find fittingAcronyms to term
    if(acronyms) {
      const acronymFuse = new Fuse(acronyms, {
        threshold: 0.3,
        isCaseSensitive: false
      });
      fittingAcronyms = this.createResultArray(acronymFuse.search(searchTerm));
    }

    // check if fittingAcronyms where found and set options for acronymsearch else do regular fuse search
    if(fittingAcronyms && fittingAcronyms.length !== 0) {
      // this options if term fits an acronym
      optionsAcronym.keys = ["acronym"]
      optionsAcronym.threshold = 0.3
      fuseAcronym = new Fuse(data, optionsAcronym)
    }

    // create Fuse object
    const fuse = new Fuse(data, this.options);

    // search with fuzzy term
    if (term) {
      const searchedItems = fuse.search(searchTerm);
      let result = this.createResultArray(searchedItems);
      // check if acronymsearch is set and concat search results
      if(fuseAcronym) {
        const searchedAcronyms = fuse.search(searchTerm);
        const resultAcronym = this.createResultArray(searchedAcronyms)
        result = [...new Set(result.concat(resultAcronym))]
      }
      return result;
    }
    
  }

  //creates an array of items that match the search
  createResultArray(searchedItems: any) {
    const resultItems = [];
    for (let searchedItem of searchedItems) {
      resultItems.push(searchedItem.item);
    }
    return resultItems;
  }
}
