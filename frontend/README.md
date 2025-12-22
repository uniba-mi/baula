# Frontend starten
Mit dem Befehl `ng serve --open` kann die Anwendung gestartet werden.

# Styling Guidelines

## Styleguide 
Hier geht's zum Styleguide (WIP): https://www.figma.com/file/d0j8C4YV1dFMASy9Ncf66T/BAULA_Styleguide-(WIP)?node-id=45%3A27. 
Die beschriebenen Farben und Elemente sind bereits im SCSS angelegt.

## Barrierefreiheitscheck
Accessibility Quick Check bei der Arbeit an Views

(Siehe auch: [https://www.notion.so/Accessibility-Recap-f7589716e68e4cb5baf21f726ad2d908])

- [ ]  Alle Buttons haben ein ARIA-label
- [ ]  Alle interaktiven Elemente sind mit der Tastatur erreichbar (z. B. tabindex=”0”; (keyup.enter) zusätzlich zu (click) usw.)
- [ ]  Elemente sind semantisch benannt und besitzen ggf. eine role
- [ ]  Responsive Check
- [ ]  Lighthouse Check

## CSS & Benennung

CSS-Klassen mit mehrwörtigen Namen werden mit - verbunden. Die Sortierung im Falle mehrerer Klassen erfolgt nach dem 'Outside-in' Prinzip, um die Lesbarkeit zu unterstützen. 

Beispiel: 
1. Positionierung
2. Box-Modell
3. Text(ausrichtung)
4. Farben und Formen
5. Sonstige

Selbst definierte Klassen sollten möglichst weit vorne stehen.

In der Anwendung wird ein Mix von Angular Material und Bootstrap verwendet. 

*Angular Material:* Komponenten an sich (z. B. Tabellen, Formularfelder, Snackbars, usw.)
*Bootstrap:* Anordnung von (Material) Komponenten und Elementen sowie Styling allgemein

## Aufbau des styles Ordners
- variables.scss enthält Variablen (z. B. Farben)
- boostrap.scss: enthält Bootstrap Elemente
- global.scss: enthält styles, die die ganze Anwendung betreffen (z. B. h1)
- helpers.scss: enthält Variablen (z. B. Farbwerte)
- ui-elements.scss: enthält (UI)-Elemente, die von mehreren Komponenten verwendet werden (z. B. Buttons, Cards, Infobox)
- components holds styles relating to one component (search panel, full calender etc.)
- fonts.scss beinhaltet die aktuelle Font (Inter)
- styles.scss: führt alle diese Dateien zusammen und ist der Styling-Einstiegspunkt

# Dialoge
- Im Ordner `/templates` befindet sich eine HTML-Vorlage für die Erstellung neuer Dialoge. Diese dienen als Vorlage und können wie bisherige Modale in der Parent-Dialog-Komponente gerendert werden.
- Neue spezifische Dialoge können mithilfe der DialogComponent angelegt werden.
- Einfache "Bestätigungsmodale" können mithilfe der ConfirmationDialogComponent und dem entsprechenden Interface angelegt werden.

# Grafiken
- Es werden Grafiken von Storyset verwendet https://storyset.com/data und in --ub-blue-60: rgb(102, 144, 177) eingefärbt