import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnivISHelperDialogComponent } from './dialog/univis-helper-dialog.component';
import { BilAppCourse } from './interfaces/bilapp';
import { CompetenceFormData } from './interfaces/form-data';
import { PublicRestService } from './public-rest.service';
import { Fulfillment } from '../../../../../interfaces/competence';

@Component({
    selector: 'app-univis-helper',
    templateUrl: './univis-helper.component.html',
    styleUrls: ['./univis-helper.component.scss'],
    standalone: false
})
export class UnivisHelperComponent implements OnInit {
  snippet: string;
  fulfillments: Fulfillment[] = [];
  showCompetences: boolean = true;
  modules: string[];
  moduleAcronyms: string[] = [];
  invalid: boolean = false;

  constructor(private dialog: MatDialog, private rest: PublicRestService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
      this.snippet = '';
  }

  getModules(data: string[]) {
    this.modules = data;
  }

  getFulfillments(data: CompetenceFormData) {
    this.invalid = data.invalid;
    this.fulfillments = data.fulfillments;
  }
  
  copyToClipboard(textfield: HTMLTextAreaElement) {
    navigator.clipboard.writeText(textfield.value);
    // show Alert
    this._snackBar.open('Der Text wurde in die Zwischenablage kopiert.', undefined, { panelClass: ['alert', 'alert-success'], duration: 5000});
  }

  generateSnippet() {
    this.snippet = ''
    if(this.modules) {
      let moduleSnippet = `##### Modulzuordnungen #####\n\n`
      for(let mod of this.modules) {
        moduleSnippet += `${mod}\n\n`
      }
      this.snippet += moduleSnippet
      this.snippet += '##########\n\n'
    }
    if(this.showCompetences && this.fulfillments && this.fulfillments.reduce((pv, cv) => pv + cv.fulfillment, 0) !== 0) {
      let competences = `\n##### Kompetenzzuordnungen #####\n\n`
      // add competences out of fulfillment into snippet
      for(let value of this.fulfillments) {
        if(value.fulfillment !== 0) {
          competences += `${this.transformCompId(value.compId)}: ${value.fulfillment}%; `
        }
      }
      this.snippet += competences
      this.snippet += '\n\n##########\n\n'
    }
  }

  selectText(textfield: HTMLTextAreaElement) {
    textfield.select();
  }

  transformCompId(competenceID: string) {
    if (competenceID) {
      if (competenceID.split('_').length == 3) {
        return competenceID.split('_')[0] + ' ' + competenceID.split('_')[1] + '.' + competenceID.split('_')[2];
      } else {
        return competenceID.split('_')[0] + ' ' + competenceID.split('_')[1];
      }
      
    } else {
      return '';
    }
  }

  openModal() {
    const dialogRef = this.dialog.open(
      UnivISHelperDialogComponent,
      {
        width: '60vw'
      }
    );
  
      dialogRef.afterClosed().subscribe(courseId => {
        if(courseId) {
          this.rest.getCompetenceAndModuleFromCourse(courseId).subscribe(course => {
            this.fetchCourseData(course);
          })
        }
    });
  }

  fetchCourseData(data: BilAppCourse) {
    this.moduleAcronyms = data.modules.map(el => el.modId);
    this.fulfillments = data.comp;
  }
}

