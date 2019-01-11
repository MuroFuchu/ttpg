import {AgmCoreModule, GoogleMapsAPIWrapper, MapsAPILoader} from '@agm/core';
import {NgZone, Injectable} from '@angular/core';
import { async } from 'rxjs/internal/scheduler/async';
import { resolveDep } from '@angular/core/src/view/provider';

import {} from 'googlemaps';

@Injectable()
export class GoogleMapsAPIWrapperEx extends GoogleMapsAPIWrapper {
    constructor(    private __loader :MapsAPILoader,
        private __zone :NgZone) {
            super(__loader, __zone);
    }

  async getAddress(lat, lng){
      var sss;
      console.log('1');
      await this.__loader.load().then(async() => {
          let geocoder = new google.maps.Geocoder();
          
          let latlng = new google.maps.LatLng(lat, lng);
          console.log('2');
          
          sss = await new Promise((resolve, reject) => {
              geocoder.geocode({ 'location': latlng}, function(results, status){
            console.log('3');
              if(status == google.maps.GeocoderStatus.OK){
                  results.forEach(resultsData => {
                      console.log(results);
                  });
                  resolve(results) ;
              }else{
                  console.log('住所を特定できなかった');
                  reject([]);
              }
          });
        }
          ) 
          console.log('4');
      })
      console.log('5');
      return sss;
    }
}