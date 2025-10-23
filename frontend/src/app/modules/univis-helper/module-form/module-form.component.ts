import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModuleAcronym } from '../../../../../../interfaces/module';
import { PublicRestService } from '../public-rest.service';

@Component({
    selector: 'uh-module-form',
    templateUrl: './module-form.component.html',
    styleUrls: ['./module-form.component.scss'],
    standalone: false
})
export class ModuleFormComponent implements OnInit, OnChanges {
  @Input() moduleAcronyms: string[];
  @Output() submitModules = new EventEmitter<string[]>();
  modules$: Observable<ModuleAcronym[]>;
  ewsI$: Observable<ModuleAcronym[]>;
  ewsII$: Observable<ModuleAcronym[]>;
  moduleForm = new FormGroup({
    selectedModules: new FormControl([''])
  })
  modules: string[] = [];

  constructor(private rest: PublicRestService) {}

  ngOnInit() {
    this.modules$ = this.rest.getModules().pipe(
      map(modules => modules.concat([
        // Insert Mockdata here
        { acronym: 'LAMOD-01-01-003', name: 'Allgemeine Pädagogik (Studienbeginn vor Sommersemester 2014)'},
        { acronym: 'LAMOD-01-01-003a', name: 'Allgemeine Pädagogik (Studienbeginn nach Sommersemester 2014)'},
        { acronym: 'LAMOD-01-01-003b', name: 'Allgemeine Pädagogik (Studienbeginn nach Wintersemester 2017/18)'},
        { acronym: 'LAMOD-01-04-002a', name: 'Basismodul Psychologie (Studienbeginn vor Sommersemester 2014)'},
        { acronym: 'LAMOD-01-04-002c', name: 'Aufbaumodul Psychologie (Studienbeginn vor Sommersemester 2014)'},
        { acronym: 'LAMOD-01-04-004', name: 'Psychologie II (Studienbeginn nach Sommersemester 2014)'},
        { acronym: 'LAMOD-01-04-005', name: 'Psychologie III (Studienbeginn nach Wintersemester 2019/20)'},
        { acronym: 'LAMOD-01-04-005a', name: 'Psychologie III (Studienbeginn nach Wintersemester 2020/21)'},
        { acronym: 'LAMOD-01-04-005b', name: 'Psychologie III (Studienbeginn nach Sommersemester 2021)'},
        { acronym: 'LAMOD-01-07-001', name: 'Schulpädagogik I (Studienbeginn vor Sommersemester 2014)'},
        { acronym: 'LAMOD-01-07-002a', name: 'Schulpädagogik II (Studienbeginn vor Sommersemester 2014)'},
        { acronym: 'LAMOD-01-07-001b', name: 'Schulpädagogik A (Studienbeginn nach Sommersemester 2014)'},
        { acronym: 'LAMOD-01-07-005', name: 'Schulpädagogik C (Studienbeginn nach Sommersemester 2014)'},
        { acronym: 'LAMOD-01-07-006', name: 'Schulpädagogik D (Studienbeginn nach Sommersemester 2014)'},
        { acronym: 'LAMOD-01-07-007', name: 'Schulpädagogik B (Studienbeginn nach Sommersemester 2014)'},
      ]).sort((a, b) => a.acronym < b.acronym ? -1 : 1)
      )
    );
    this.ewsI$ = this.modules$.pipe(
      map(modules => modules.filter(el => 
        el.acronym.startsWith('LAMOD-01-01') ||
        el.acronym.startsWith('LAMOD-01-04') ||
        el.acronym.startsWith('LAMOD-01-07') ||
        el.acronym.startsWith('LAMOD-01-10')
      ))
    );
    this.ewsII$ = this.modules$.pipe(
      map(modules => modules.filter(el => 
        !el.acronym.startsWith('LAMOD-01-01') &&
        !el.acronym.startsWith('LAMOD-01-04') &&
        !el.acronym.startsWith('LAMOD-01-07') &&
        !el.acronym.startsWith('LAMOD-01-10')
      ))
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.moduleAcronyms && this.modules$) {
      firstValueFrom(this.modules$.pipe(
        map( mas => mas.filter(el => this.moduleAcronyms.includes(el.acronym)))
      )).then(data => {
        let modules: string[] = [];
        for(let d of data) {
          modules.push(`${d.name} (${d.acronym})`)
        }
        this.moduleForm.controls.selectedModules.patchValue(modules);
        this.modules = modules;
        this.submitModules.emit(modules)
      })
      
    }
  }

  changeSelection(value: string[]) {
    this.submitModules.emit(value);
  }
}
