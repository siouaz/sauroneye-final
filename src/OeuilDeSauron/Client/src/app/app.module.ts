import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthorizationGuard } from './authorisation/authorization.guard';
import { AuthorizationService } from './authorisation/authorization.service';


// export function MSALInstanceFactory(): IPublicClientApplication {
//   return new PublicClientApplication(msalConfig);
// }


// export function MSALGuardConfigFactory(): MsalGuardConfiguration {
//   return {
//     interactionType: InteractionType.Redirect,
//   };
// }

@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent
  ],
  imports: [
    AppRoutingModule,
    AppLayoutModule,
    HttpClientModule,
    ReactiveFormsModule,



  ],
  providers: [
    // { provide: LocationStrategy, useClass: HashLocationStrategy },
    CountryService,
    CustomerService,
    EventService,
    IconService,
    NodeService,
    PhotoService,
    ProductService,
    AuthorizationService
    // {
    //   provide: MSAL_INSTANCE,
    //   useFactory: MSALInstanceFactory
    // },
    // {
    //   provide: MSAL_GUARD_CONFIG,
    //   useFactory: MSALGuardConfigFactory
    // },
    // MsalService,
    // MsalGuard,
    // MsalBroadcastService,


  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

