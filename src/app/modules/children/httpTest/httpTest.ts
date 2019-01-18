import {Component} from '@angular/core';
import * as ons from 'onsenui';
import {OnsNavigator,OnsenModule} from 'ngx-onsenui' 

import {Map} from '../map/map';
import {RegistrationList} from '../registrationList/registrationList';
import {Upload} from '../upload/upload';
import { TimeTrip } from '../timeTrip/timeTrip';

import {IndexedDbService} from '../../../services/IndexedDbService';//ﾃﾞｭｸｼ
import { HttpService } from 'src/app/services/HttpService';
import { Menu } from '../menu/menu';
import { Local } from 'protractor/built/driverProviders';

@Component({
  selector: "ons-page[title='httpTest']",
  templateUrl: './httpTest.html',
  styleUrls: ['./httpTest.css']
})
export class httpTest {
  arg1="タイトル１"; arg2="府中市"; arg3="35.672074"; arg4="139.480319";

  constructor(private _navigator: OnsNavigator , private _indexedDbService: IndexedDbService, private _httpService: HttpService) {}

  goToMenu() {
    this._navigator.nativeElement.pushPage(Menu, {data: {hoge: "fuga"}});
  }

  async goGetLocation() {
    var location = await this._httpService.GetLocation(Number(this.arg1), Number(this.arg2), Number(this.arg3));
    let m;
    for (let key of Object.keys(location)) {
      console.log(key, location[key]);
    }
    if(location.locations && location.locations.length > 0){
      location.locations.map(v => {
        m = [
          `locationID:${v.locationID}`,
          `title:${v.title}`,
          `address:${v.address}`,
          `latitude:${v.latitude}`,
          `longitude:${v.longitude}`,
          `distance:${v.distance}`
        ];
        ons.notification.alert({ messageHTML: this.forHtml(m), title:'GetLocation' });
      }, this);
    }else{
      ons.notification.alert({ message: `StatusCd:${location.statusCd}<br>message:${location.messages}`, title:'GetLocation' });
    }

  }
  
  async goAddLocation() {
    var location = await this._httpService.AddLocation(this.arg1, this.arg2, Number(this.arg3), Number(this.arg4));
    for (let key of Object.keys(location)) {
      console.log(key, location[key]);
    }
    ons.notification.alert({ messageHTML: `statusCd:${location.statusCd}<br>locationCd:${location.locationID}`, title:'AddLocation' });
  }

  async goGetPhoto() {
    var photo = await this._httpService.GetPhoto(Number(this.arg1), Number(this.arg2));
    let m;
    for(let k of Object.keys(photo)){
      console.log(k, photo[k]);
    }
    photo.photos.map(v => {
      m = [
        `year:${v.year}`,
        `comment:${v.comment}`,
        `bin:${v.bin}`
      ];
      ons.notification.alert({ messageHTML: this.forHtml(m), title:'GetPhoto' });
    }, this);
  }

  async goAddPhoto() {
    var photo = await this._httpService.AddPhoto(Number(this.arg1), Number(this.arg2), this.arg3, this.arg4);
    ons.notification.alert({ messageHTML: `statusCd:${photo.statusCd}<br>photoId:${photo.photoID}`, title:'AddPhoto' });
  }

  forHtml(str: string[]) {
    let s = "";
    str.map(m => {
      s += m+"<br>";
    });
    return s.slice(0, -4);
  }
}
