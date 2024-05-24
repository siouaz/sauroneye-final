import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { LoginComponent } from './auth/login/login.component';
import { AuthorizationGuard } from './authorisation/authorization.guard';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: AppLayoutComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
            },
            {
                path: 'pages',
                loadChildren: () => import('../app/pages/pages.module').then(m => m.PagesModule), canActivate: [AuthorizationGuard], canLoad: [AuthorizationGuard]
            }
        ],

        // canLoad: [AuthorizationGuard]
    },
    { path: '**', redirectTo: 'error/404' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}
