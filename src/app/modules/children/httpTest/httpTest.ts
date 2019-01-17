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

@Component({
  selector: "ons-page[title='httpTest']",
  templateUrl: './httpTest.html',
  styleUrls: ['./httpTest.css']
})
export class httpTest {
  arg1=""; arg2=""; arg3=""; arg4="";


  constructor(private _navigator: OnsNavigator , private _indexedDbService: IndexedDbService, private _httpService: HttpService) {}

  goToMenu() {
    this._navigator.nativeElement.pushPage(Menu, {data: {hoge: "fuga"}});
  }

  async goGetLocation() {
    var location = await this._httpService.GetLocation(Number(this.arg1), Number(this.arg2), Number(this.arg3)).toPromise();
    console.log(location);
  }
  
  async goAddLocation() {
    var location = await this._httpService.AddLocation(this.arg1, this.arg2, Number(this.arg3), Number(this.arg4)).toPromise();
    console.log(location);
  }

  async goGetPhoto() {
    var photo = await this._httpService.GetPhoto(Number(this.arg1), Number(this.arg2)).toPromise();
    console.log(photo);
  }

  async goAddPhoto() {
    var photo = await this._httpService.AddPhoto(Number(this.arg1), Number(this.arg2), this.arg3, this.arg4).toPromise();
    console.log(photo);
  }
}
