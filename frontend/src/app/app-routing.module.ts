import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './guards/admin-guard';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { ModuleOverviewComponent } from './home/module-overview/module-overview.component';
import { SemesterPlanComponent } from './home/semester-plan/semester-plan.component';
import { StudyPlanDetailComponent } from './home/study-plan/study-plan-detail/study-plan-detail.component';
import { StudyPlanComponent } from './home/study-plan/study-plan.component';
import { WelcomeComponent } from './public/welcome/welcome.component';
import { PublicationsComponent } from './public/publications/publications.component';
import { AboutComponent } from './public/about/about.component';
import { HomeComponent } from './home/home.component';
import { PrivacyComponent } from './public/privacy/privacy.component';
import { UserProfileComponent } from './home/user-profile/user-profile.component';
import { HelpComponent } from './public/help/help.component';
import { authGuard } from './shared/auth/auth.guard';
import { LoginComponent } from './login/login.component';
import { UserDataComponent } from './home/user-profile/user-data/user-data.component';
import { StudypathUpdateComponent } from './home/user-profile/studypath-update/studypath-update.component';
import { RecommendationComponent } from './home/recommendation/recommendation.component';
import { TopicSettingsComponent } from './home/recommendation/topic-settings/topic-settings.component';
import { RecsSettingsComponent } from './home/user-profile/recs-settings/recs-settings.component';
import { JobSettingsComponent } from './home/recommendation/job-settings/job-settings.component';
import { UserConsentsComponent } from './home/user-profile/user-consents/user-consents.component';

const routes: Routes = [
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: 'publikationen',
    component: PublicationsComponent,
  },
  {
    path: 'datenschutz',
    component: PrivacyComponent,
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'app',
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      /* {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      }, */
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'modulkatalog',
        component: ModuleOverviewComponent,
      },
      {
        path: 'semester',
        component: SemesterPlanComponent,
      },
      {
        path: 'studium',
        children: [
          {
            path: 'ueberblick',
            component: StudyPlanComponent,
          },
          {
            path: 'studienplan/:id',
            component: StudyPlanDetailComponent,
          },
        ],
      },
      {
        path: 'personalisierung',
        component: RecommendationComponent,
        children: [
          {
            path: '',
            redirectTo: 'topics',
            pathMatch: 'full',
          },
          {
            path: 'topics',
            component: TopicSettingsComponent,
          },
          {
            path: 'jobs',
            component: JobSettingsComponent,
          },
        ]
      },
      {
        path: 'profil',
        component: UserProfileComponent,
        children: [
          {
            path: '',
            redirectTo: 'daten',
            pathMatch: 'full',
          },
          {
            path: 'daten',
            component: UserDataComponent,
          },
          {
            path: 'verlauf-verwalten',
            component: StudypathUpdateComponent,
          },
          {
            path: 'datenschutz-einwilligung',
            component: UserConsentsComponent,
          },
          {
            path: 'einstellung-empfehlungen',
            component: RecsSettingsComponent,
          },
        ],
      },
      {
        path: 'kompetenzen',
        loadChildren: () =>
          import('./modules/bilapp/bilapp.module').then((m) => m.BilappModule),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./modules/admin/admin.module').then((m) => m.AdminModule),
        canActivate: [AdminGuard],
      },
    ],
  },
  {
    path: 'hilfe',
    component: HelpComponent,
  },
  {
    path: 'ueber-uns',
    component: AboutComponent,
  },
  {
    path: 'univis-snippet',
    loadChildren: () =>
      import('./modules/univis-helper/univis-helper.module').then(
        (m) => m.UnivisHelperModule
      ),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      //scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
