import {Component, HostListener} from '@angular/core';
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
  presentLat: number;
  presentLng: number;

  constructor(private _navigator: OnsNavigator , private _indexedDbService: IndexedDbService) {}

  @HostListener('show')
  show(e) {
    this.getGeo();
  }

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

  ngOnInit(){
    
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
    this._navigator.nativeElement.pushPage(Map, {data: { "PresentLat": this.presentLat, "PresentLng": this.presentLng }});
  }

  goToRegistrationList() {
    this._navigator.nativeElement.pushPage(RegistrationList, {data: {hoge: "fuga"}});
  }

  goToUpload() {
    this._navigator.nativeElement.pushPage(Upload, {data: {hoge: "fuga"}});
  }

  // 現在地を取得する
  async getGeo() {
    var option = { timeout: 6000 }; //タイムアウト値(ミリ秒)
    var comp = this;
    navigator.geolocation.getCurrentPosition(
      function(position){
        comp.presentLat = position.coords.latitude;
        comp.presentLng = position.coords.longitude;
        console.log("Get Geo OK.");
      },
      function(){
        comp.presentLat = null;
        comp.presentLng = null;
        console.error("Get Geo NG.");
        // ons.notification.alert({ message: '地点情報を取得できるように設定してからご使用くださいね！', title:'現在地が取得できませんでした', callback:function(){
        // }});
      },
      option
    );

  }
}
