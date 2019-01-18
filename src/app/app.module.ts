// Application code starts here
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HttpModule } from '@angular/http';
import { AgmCoreModule } from '@agm/core';

import {OnsenModule} from 'ngx-onsenui';

import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

// Add
import { Menu } from './modules/children/menu/menu';
import { Map } from './modules/children/map/map';
import { RegistrationList } from './modules/children/registrationList/registrationList';
import { Upload } from './modules/children/upload/upload';
import { TimeTrip } from './modules/children/timeTrip/timeTrip';
import { httpTest } from './modules/children/httpTest/httpTest';

// Service
import { IndexedDbService } from './services/IndexedDbService';
import { DexieServiceEx } from './services/DexieServiceEx';
import { GetJsonService } from './services/GetJsonService';
import { GoogleMapsAPIWrapperEx } from './services/GoogleMapsAPIWrapperEx';
import { DexieModule, DexieConfig } from './services/ngx-dexie';
import { HttpService } from "./services/HttpService";
import { ReduceImageSizeService } from 'src/app/services/ReduceImageSizeService';
 
const config: DexieConfig = {
  databaseName: 'TimeTripPhotoGallery',//your database name here
  schema: {
    CheakInitData: '++ID',
    TrnPhotoInfo: '++PhotoID,Year,LocationID,Comment,Bin,LastUpdateDateTime',
    MstLocationInfo: '++LocationID,Title,Address,Latitude,Longitude'
  } // any schema of your choice
};

@NgModule({
  imports: [
    BrowserModule,
    OnsenModule,
    AgmCoreModule.forRoot({
        apiKey: 'AIzaSyCju8LIyDfOiDbk53jDrNnW1ifs7F-4tEU'
      }),
     HttpModule,
     HttpClientModule,
     CommonModule,
     FormsModule,
     DexieModule.forRoot(config)
  ],
  declarations: [
    AppComponent,
    Menu,
    Map,
    RegistrationList,
    Upload,
    TimeTrip,
    httpTest,
  ],
  entryComponents: [
    Menu,
    Map,
    RegistrationList,
    Upload,
    TimeTrip,
    httpTest,
  ],
  providers: [
    IndexedDbService,
    DexieServiceEx,
    GetJsonService,
    GoogleMapsAPIWrapperEx,
    HttpService,
    ReduceImageSizeService,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
