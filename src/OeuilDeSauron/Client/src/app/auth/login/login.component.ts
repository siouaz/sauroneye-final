
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CurrentUser } from 'src/app/authorisation/current-user';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
      :host ::ng-deep .pi-eye,
      :host ::ng-deep .pi-eye-slash {
          transform:scale(1.6);
          margin-right: 1rem;
          color: var(--primary-color) !important;
      }
  `]
})
export class LoginComponent implements OnInit {
    public action = '/api/authentication/external-login?provider=OpenIdConnect&returnUrl=/';



    user: CurrentUser;
    constructor(private route: ActivatedRoute, private auth: ApiService) { }

    public ngOnInit(): void {
        // Redirection
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
            this.action += `?returnUrl=${returnUrl}`;
        }
        this.auth.getCurrentUser().subscribe(res => {
            this.user = res;
        })

    }


}
