import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
//import { silentRequest } from './auth-config';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {


    loggedIn: boolean;
    constructor(private primengConfig: PrimeNGConfig, private router: Router) { }

    ngOnInit() {

        this.primengConfig.ripple = true;
    }

}
