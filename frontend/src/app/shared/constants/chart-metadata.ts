export const chartMetadata: ChartMetadata[] = [
    { key: 'quick-links', name: $localize`Quick Links`, desc: $localize`Hier findest du die Links zu den wichtigsten Uni-Diensten.`, icon: 'bi-link-45deg' },
    { key: 'user-data', name: $localize`Meine Daten`, desc: $localize`Hier siehst du die Daten zu deinem Studium`, icon: 'bi-file-earmark-text' },
    { key: 'total-ects-progress', name: $localize`ECTS Fortschritt (Gesamt)`, desc: $localize`Dieses Diagramm zeigt dir deinen ECTS Fortschritt aufsummiert über die einzelnen Semester.`, icon: 'bi-graph-up' },
    { key: 'total-module-progress', name: $localize`Modulbelegungen (Gesamt)`, desc: $localize`Dieses Diagramm zeigt dir an, wie viele Module bereits belegt, bestanden und nicht bestanden hast.`, icon: 'bi-graph-up' },
    { key: 'semester-ects-progress', name: $localize`ECTS Fortschritt nach Semester`, desc: $localize`Dieses Diagramm gibt dir einen detaillierten Einblick, wie sich dein ECTS Fortschritt nach Semester im Vergleich zu deinem Plan verhält.`, icon: 'bi-graph-up' },
    { key: 'semester-module-progress', name: $localize`Modul Fortschritt nach Semester`, desc: $localize`Dieses Diagramm zeigt dir für die einzelnen Semester, wie viele Module du belegt, bestanden und nicht bestanden hast.`, icon: 'bi-graph-up' },
    { key: 'module-group-progress', name: $localize`Belegungen in Modulgruppen`, desc: $localize`Dieses Diagramm zeigt dir wie viele Module in welchen Modulgruppen bereits absolviert hast.`, icon: 'bi-graph-up' },
    { key: 'semester-dates', name: $localize`Aktuelle Termine`, desc: $localize`Hier werden dir wichtige Termine des aktuellen Semesters angezeigt.`, icon: 'bi-calendar-event' },
    { key: 'calendar', name: $localize`Terminkalender`, desc: $localize`Hier findest du eine kleine Version deines Stundenplans, um schnell die heutigen Termine zu finden.`, icon: 'bi-calendar-date' },
    { key: 'gpa', name: $localize`Notendurchschnitt`, desc: $localize`Hier siehst du deinen angenährten derzeitigen Notendurschnitt`, icon: 'bi-slash-circle' },
    { key: 'personalisation', name: $localize`Personalisierung`, desc: $localize`Hier siehst du den aktuellen Stand der Personalisierung`, icon: 'bi-magic' },
    { key: 'feature-wish', name: $localize`Feature Vorschlag`, desc: $localize`Hier kannst du ein neues Feature für Baula vorschlagen`, icon: 'bi-magic'}
];

export interface ChartMetadata {
    key: string,
    name: string,
    desc: string,
    icon: string,
}