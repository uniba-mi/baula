import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResolveCollisionDialogComponent } from './resolve-collision-dialog.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ResolveCollisionDialogComponent', () => {
  let component: ResolveCollisionDialogComponent;
  let fixture: ComponentFixture<ResolveCollisionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResolveCollisionDialogComponent],
      schemas: [NO_ERRORS_SCHEMA] // Verhindert Fehler durch unbekannte Komponenten
    }).compileComponents();

    fixture = TestBed.createComponent(ResolveCollisionDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle course to remove', () => {
    // Prüfe das Hinzufügen eines Kurses
    component.setCourseToDelete('1');
    expect(component.coursesToDelete).toContain('1');

    // Prüfe das Entfernen eines Kurses
    component.setCourseToDelete('1');
    expect(component.coursesToDelete).not.toContain('1');
  });

  it('should toggle course to remove correctly', () => {
    // Fügen Sie einen Kurs hinzu
    component.setCourseToDelete('2');
    expect(component.coursesToDelete).toContain('2');

    // Fügen Sie denselben Kurs erneut hinzu, um ihn zu entfernen
    component.setCourseToDelete('2');
    expect(component.coursesToDelete).not.toContain('2');
  });

  it('should expand course details', () => {
    expect(component.expandedCourseDetails).toBeFalse();
    component.expandedCourseDetails = true;
    expect(component.expandedCourseDetails).toBeTrue();
  });

  it('should initialize coursesToDelete as an empty array', () => {
    expect(component.coursesToDelete).toEqual([]);
  });
});