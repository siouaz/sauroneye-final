import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { LoginComponent } from './auth/login/login.component';

import { authGuard } from './services/auth.guard';

const routes: Routes = [
    
    {
        path: 'auth',
        loadChildren: () => import('../app/auth/auth.module').then(m => m.AuthModule), 
    },
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
                loadChildren: () => import('../app/pages/pages.module').then(m => m.PagesModule),
            },
            
        ],
        canActivate: [authGuard],    
    },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}
