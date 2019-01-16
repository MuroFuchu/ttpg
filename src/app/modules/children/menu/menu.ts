import {Component} from '@angular/core';
import * as ons from 'onsenui';
import {OnsNavigator,OnsenModule} from 'ngx-onsenui' 

import {Map} from '../map/map';
import {RegistrationList} from '../registrationList/registrationList';
import {Upload} from '../upload/upload';
import { TimeTrip } from '../timeTrip/timeTrip';
import { httpTest } from '../httpTest/httpTest';

import {IndexedDbService} from '../../../services/IndexedDbService';//ﾃﾞｭｸｼ

@Component({
  selector: "ons-page[title='menu']",
  templateUrl: './menu.html',
  styleUrls: ['./menu.css']
})
export class Menu {
  constructor(private _navigator: OnsNavigator , private _indexedDbService: IndexedDbService) {}

  deleteDataBase() {
    ons.notification.confirm({
      title: "確認",
      message: "データベースを削除しますか？",
      cancelable: true,
      callback: i => {
        if (i == 1) {
          this._indexedDbService.deleteDatabase();
        }
      }
    });
    
  }

  async goToTimeTrip() {
    var min = 1 ;
    var max = await this._indexedDbService.countLocationInfo();
    
    var r = Math.floor( Math.random() * (max + 1 - min) ) + min ;

    this._navigator.nativeElement.pushPage(TimeTrip, {data: { "LocationID" : r}});
  }
  
  goToHttpTest(){
    this._navigator.nativeElement.pushPage(httpTest, {data: {hoge: "fuga"}});
  }

  goToMap() {
    this._navigator.nativeElement.pushPage(Map, {data: {hoge: "fuga"}});
  }

  goToRegistrationList() {
    this._navigator.nativeElement.pushPage(RegistrationList, {data: {hoge: "fuga"}});
  }

  goToUpload() {
    this._navigator.nativeElement.pushPage(Upload, {data: {hoge: "fuga"}});
  }
}
