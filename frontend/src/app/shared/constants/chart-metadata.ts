export const chartMetadata: ChartMetadata[] = [
    { key: 'quick-links', name: 'Quick Links', desc: 'Hier findest du die Links zu den wichtigsten Uni-Diensten.', icon: 'bi-link-45deg' },
    { key: 'user-data', name: 'Meine Daten', desc: 'Hier siehst du die Daten zu deinem Studium', icon: 'bi-file-earmark-text' },
    { key: 'total-ects-progress', name: 'ECTS Fortschritt (Gesamt)', desc: 'Dieses Diagramm zeigt dir deinen ECTS Fortschritt aufsummiert über die einzelnen Semester.', icon: 'bi-graph-up' },
    { key: 'total-module-progress', name: 'Modulbelegungen (Gesamt)', desc: 'Dieses Diagramm zeigt dir an, wie viele Module bereits belegt, bestanden und nicht bestanden hast.', icon: 'bi-graph-up' },
    { key: 'semester-ects-progress', name: 'ECTS Fortschritt nach Semester', desc: 'Dieses Diagramm gibt dir einen detaillierten Einblick, wie sich dein ECTS Fortschritt nach Semester im Vergleich zu deinem Plan verhält.', icon: 'bi-graph-up' },
    { key: 'semester-module-progress', name: 'Modul Fortschritt nach Semester', desc: 'Dieses Diagramm zeigt dir für die einzelnen Semester, wie viele Module du belegt, bestanden und nicht bestanden hast.', icon: 'bi-graph-up' },
    { key: 'module-group-progress', name: 'Belegungen in Modulgruppen', desc: 'Dieses Diagramm zeigt dir wie viele Module in welchen Modulgruppen bereits absolviert hast.', icon: 'bi-graph-up' },
    { key: 'semester-dates', name: 'Aktuelle Termine', desc: 'Hier werden dir wichtige Termine des aktuellen Semesters angezeigt.', icon: 'bi-calendar-event' },
    { key: 'calendar', name: 'Terminkalender', desc: 'Hier findest du eine kleine Version deines Stundenplans, um schnell die heutigen Termine zu finden.', icon: 'bi-calendar-date' },
    { key: 'gpa', name: 'Notendurchschnitt', desc: 'Hier siehst du deinen angenährten derzeitigen Notendurschnitt', icon: 'bi-slash-circle' },
    { key: 'personalisation', name: 'Personalisierung', desc: 'Hier siehst du den aktuellen Stand der Personalisierung', icon: 'bi-magic' }
];

export interface ChartMetadata {
    key: string,
    name: string,
    desc: string,
    icon: string,
}