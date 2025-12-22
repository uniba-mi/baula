import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationDialogComponent, ConfirmationDialogData } from './confirmation-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let mockDialogRef: MatDialogRef<ConfirmationDialogComponent>;
  let mockCallbackMethod: jasmine.Spy;

  beforeEach(async () => {
    mockCallbackMethod = jasmine.createSpy('callbackMethod');

    mockDialogRef = {
      disableClose: false,
      close: () => {}
    } as any;

    await TestBed.configureTestingModule({
      declarations: [ConfirmationDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { confirmButtonLabel: 'Bestätigen', cancelButtonLabel: 'Abbrechen', callbackMethod: mockCallbackMethod } }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Verhindert Fehler durch unbekannte Komponenten
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call callbackMethod on dialog submit', () => {
    component.handleDialogSubmit();
    expect(mockCallbackMethod).toHaveBeenCalled();
  });

  it('should render correct title in dialog', () => {
    const title = 'Bestätigungsdialog';
    component.data.dialogTitle = title;
    fixture.detectChanges();
    const titleElement: HTMLElement = fixture.nativeElement.querySelector('p[mat-dialog-title]');
    expect(titleElement.textContent).toContain(title);
  });

  it('should render delete confirmation message', () => {
    component.data.actionType = 'delete';
    component.data.confirmationItem = 'Kurs 1';
    fixture.detectChanges();
    
    const messageElement: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(messageElement.textContent).toContain('Bist du sicher, dass du Kurs 1 löschen möchtest?');
  });

  it('should render add confirmation message', () => {
    component.data.actionType = 'add';
    component.data.confirmationItem = 'Kurs 1';
    fixture.detectChanges();
    
    const messageElement: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(messageElement.textContent).toContain('Bist du sicher, dass du Kurs 1 hinzufügen möchtest?');
  });

  it('should render update confirmation message', () => {
    component.data.actionType = 'update';
    component.data.confirmationItem = 'Kurs 1';
    fixture.detectChanges();
    
    const messageElement: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(messageElement.textContent).toContain('Bist du sicher, dass du Kurs 1 aktualisieren möchtest?');
  });

  it('should render default confirmation message when actionType is not provided', () => {
    component.data.actionType = undefined;
    component.data.confirmationItem = 'Kurs 1';
    fixture.detectChanges();
    
    const messageElement: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(messageElement.textContent).toContain('Bist du sicher, dass du mit Kurs 1 fortfahren möchtest?');
  });

  it('should render warning message if provided', () => {
    const warningMessage = 'Achtung: Diese Aktion ist nicht rückgängig zu machen.';
    component.data.warningMessage = warningMessage;
    fixture.detectChanges();
    
    const warningElement: HTMLElement = fixture.nativeElement.querySelector('.fw-semibold');
    expect(warningElement.textContent).toContain(warningMessage);
  });
});