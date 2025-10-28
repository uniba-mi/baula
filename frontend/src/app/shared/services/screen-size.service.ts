import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScreenSizeService {

    isSmallScreen$: Observable<boolean>;
    isLargeScreen$: Observable<boolean>;
    isSidenavFullScreen$: Observable<boolean>;
    isXXLScreen$: Observable<boolean>;

    constructor(private breakpointObserver: BreakpointObserver) {

        // detect small screens for mobile add courses btn in timetable
        this.isSmallScreen$ = this.breakpointObserver.observe([Breakpoints.Handset])
            .pipe(map(result => result.matches));

        this.isLargeScreen$ = this.breakpointObserver.observe(['(min-width: 992px)'])
            .pipe(map(result => result.matches));

        // detect course sidenav fullscreen mode (below 1200px)
        this.isSidenavFullScreen$ = this.breakpointObserver.observe(['(max-width: 1199.98px)'])
            .pipe(map(result => result.matches));

        // detect XXL screen size (1400px and above)
        this.isXXLScreen$ = this.breakpointObserver.observe(['(min-width: 1400px)'])
            .pipe(map(result => result.matches));
    }
}