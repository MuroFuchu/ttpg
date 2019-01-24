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
  afterGetGeo: boolean = false;

  constructor(private _navigator: OnsNavigator , private _indexedDbService: IndexedDbService) {}

  @HostListener('show')
  async show(e) {
    await this.getGeo();
    this.afterGetGeo = true;
  }

  deleteDataBase() {
    ons.notification.confirm({
      title: "確認",
      message: "キャッシュを削除しますか？",
      cancelable: true,
      callback: i => {
        if (i == 1) {
          //this._indexedDbService.deleteDatabase();
          this._indexedDbService.deleteAllMstLocationInfo();
          this._indexedDbService.deleteAllTrnPhotoInfo();
        }
      }
    });
    
  }

  ngOnInit(){
    
  }

  async goToTimeTrip() {
    // GetGeo未完了時は処理を中断させる
    if (this.afterGetGeo == false){ return; }

    var min = 1 ;
    var max = await this._indexedDbService.countLocationInfo();
    
    var r = Math.floor( Math.random() * (max + 1 - min) ) + min ;

    this._navigator.nativeElement.pushPage(TimeTrip, {data: { "LocationID" : r}});
  }
  
  goToHttpTest(){
    // GetGeo未完了時は処理を中断させる
    if (this.afterGetGeo == false){ return; }

    this._navigator.nativeElement.pushPage(httpTest, {data: {hoge: "fuga"}});
  }

  goToMap() {
    // GetGeo未完了時は処理を中断させる
    if (this.afterGetGeo == false){ return; }

    this._navigator.nativeElement.pushPage(Map, {data: { "PresentLat": this.presentLat, "PresentLng": this.presentLng }});
  }

  goToRegistrationList() {
    // GetGeo未完了時は処理を中断させる
    if (this.afterGetGeo == false){ return; }

    this._navigator.nativeElement.pushPage(RegistrationList, {data: { "PresentLat": this.presentLat, "PresentLng": this.presentLng }});
  }

  goToUpload() {
    // GetGeo未完了時は処理を中断させる
    if (this.afterGetGeo == false){ return; }

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
        console.error("Get Geo NG.");
        // ons.notification.alert({ message: '地点情報を取得できるように設定してからご使用くださいね！', title:'現在地が取得できませんでした', callback:function(){
        // }});
      },
      option
    );
  }
}
