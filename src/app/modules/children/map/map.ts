import * as ons from 'onsenui';
import {Upload} from '../upload/upload';
import {TimeTrip} from '../timeTrip/timeTrip';
import {OnsNavigator,OnsenModule,Params} from 'ngx-onsenui' ;
import {Component, NgZone, Injectable, OnInit, EventEmitter} from '@angular/core';
import {MapsAPILoader,GoogleMapsAPIWrapper, MouseEvent, AgmMap, AgmMarker, AgmInfoWindow } from '@agm/core';
import {IndexedDbService} from '../../../services/IndexedDbService';//ﾃﾞｭｸｼ
import {GoogleMapsAPIWrapperEx} from '../../../services/GoogleMapsAPIWrapperEx';//ｸﾞｰｸﾞﾙ

@Component({
  selector: "ons-page[title='map']",
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})

export class Map implements OnInit {
  locationID: number;
  address: string;
  presentLat: number;
  presentLng: number;
  centerLat:number;
  centerLng:number;
  lastClicklat: number;
  lastClicklng: number;
  markers: marker[] = [];
  zone: NgZone;
  apiLoader: MapsAPILoader;
  apiWrapper:GoogleMapsAPIWrapper;
  map;
  lastOpenWindow;
  createWindow = null;
  txtTitle: string = '';
  selectedAddresses: string = '';// 住所を選択した値が入る
  selectedMarkerPin: string;
  /*
  markerPinNormal: string = require('../../../../contents/icons/pin_normal.svg');//マーカーピンのアイコンURL
  markerPinSelected: string = require('../../../../contents/icons/pin_free.svg');//マーカーピンのアイコンURL
  nowPlacePin: string = require('../../../../contents/icons/pin_nowPlace.svg');//マーカーピンのアイコンURL
  iconPathInfo: string = require('../../../../contents/buttons/showInfo.png');
  iconPathTrip: string = require('../../../../contents/buttons/goToTrip.png');
  iconPathRegist: string = require('../../../../contents/buttons/goToRegist.png');
  */
  markerPinNormal: string = './assets/contents/icons/pin_normal.svg';//マーカーピンのアイコンURL
  markerPinSelected: string = './assets/contents/icons/pin_free.svg';//マーカーピンのアイコンURL
  nowPlacePin: string = './assets/contents/icons/pin_nowPlace.svg';//マーカーピンのアイコンURL
  iconPathInfo: string = './assets/contents/buttons/showInfo.png';
  iconPathTrip: string = './assets/contents/buttons/goToTrip.png';
  iconPathRegist: string = './assets/contents/buttons/goToRegist.png';
  iconPathRegist2: string = 'src/';
  addressList:any[];
  constructor(private _navigator: OnsNavigator, private _indexedDbService: IndexedDbService, private _googleMapsAPIWrapperEx: GoogleMapsAPIWrapperEx, private _params: Params) {}

  async ngOnInit() {
    this.presentLat = this._params.data.PresentLat;
    this.presentLng = this._params.data.PresentLng;
    var comp = this;

    if(this.presentLat != null || this.presentLng != null){
      this.changeCenter(comp.presentLat,comp.presentLng);
      this.getMapData(comp.centerLat,comp.centerLng);
      this.displayPin();
    }else{
      ons.notification.alert({ message: '地点情報を取得できるように設定してからご使用くださいね！', title:'現在地が取得できませんでした', callback:function(){
        comp.changeCenter(comp.presentLat,comp.presentLng);
        comp.getMapData(comp.centerLat,comp.centerLng);
        comp.displayPin();
      }});
    }
  }

  // 現在地を取得する
  async getGeo() {
    var option = { timeout: 6000 }; //タイムアウト値(ミリ秒)
    var comp = this;
    navigator.geolocation.getCurrentPosition(
      function(position){
        comp.presentLat = position.coords.latitude;
        comp.presentLng = position.coords.longitude;
        //comp.presentLat =  42.319744;// 室蘭NISCO仕様
        //comp.presentLng = 140.986007;// 室蘭NISCO仕様
        //comp.presentLat =  39.640479;// 宮古駅仕様
        //comp.presentLng = 141.946646;// 宮古駅仕様

        comp.changeCenter(comp.presentLat,comp.presentLng);
        comp.getMapData(comp.centerLat,comp.centerLng);
        comp.displayPin();
      },
      function(){
        ons.notification.alert({ message: '地点情報を取得できるように設定してからご使用くださいね！', title:'現在地が取得できませんでした', callback:function(){
          //comp.presentLat =  42.319744;// 室蘭NISCO仕様
          //comp.presentLng = 140.986007;// 室蘭NISCO仕様
          //comp.presentLat =  39.640479;// 宮古駅仕様
          //comp.presentLng = 141.946646;// 宮古駅仕様
          comp.changeCenter(comp.presentLat,comp.presentLng);
          comp.getMapData(comp.centerLat,comp.centerLng);
          comp.displayPin();
        }});
      },
      option
    );
    
  }  

  // 画面にピンを表示する
  displayPin(){
    this.apiWrapper = new GoogleMapsAPIWrapper(this.apiLoader,this.zone);
    this.apiWrapper.getCenter()
    .then(function(value){
      console.log(value);
    })
    .catch(function(value){
      console.log(value);
    });
   
  }
  // セットした地点のマーカー情報を取得する
  async dblClickMap($event: MouseEvent){
    this.lastOpenWindow = this;
    this.resetInput();
    this.lastClicklat = $event.coords.lat;
    this.lastClicklng = $event.coords.lng;
    this.addressList = await this._googleMapsAPIWrapperEx.getAddress(this.lastClicklat, this.lastClicklng);//座標から住所を取得する
    this.address = this.addressList[0].formatted_address;
    console.log('最後にクリックしたx座標' + this.lastClicklat.toString());
    console.log('最後にクリックしたy座標' + this.lastClicklng.toString());
    console.log('選択した住所→' + this.selectedAddresses.toString());
  }
  //選択したマーカーの情報を取得する
  clickMarker(m: marker, selectedInfoWindow){
    selectedInfoWindow.close();
    this.lastOpenWindow = selectedInfoWindow;
    this.locationID = m.LocationID;
    this.address = m.Address;
    this.resetPinMarker();//ピンマーカーをすべて初期化する
    m.iconUrl = this.markerPinSelected;
    this.selectedMarkerPin = m.iconUrl;// 新しいアイコン情報を取得する
    this.changeCenter(m.Latitude,m.Longitude);
  }
  //指定された座標を中心にする
  changeCenter(lat:number, lng:number){
    this.centerLat = lat;
    this.centerLng = lng;
  }
  /* DBアクセス系 */
  // データ取得
  async getMapData(lat:number, lng:number){
    //var data = await this._indexedDbService.getMstLocationByRange(lat,lng);
    var data = await this._indexedDbService.getMstLocationInfo();
    if(data==null){
      console.log('データが取得できなかった');
      this.markers = [];
    }else{
      data.forEach(data => {
        this.markers.push(
          { LocationID:data.LocationID,
            Title:data.Title,
            Address:data.Address,
            Latitude:data.Latitude,
            Longitude:data.Longitude,
            iconUrl:this.markerPinNormal
          }
        );
      });
    }
  }
  // 地点登録
  async registMapMst(lat:number, lng:number, infoWindow){
    var address;
    address = this._googleMapsAPIWrapperEx.getAddress(lat, lng);
    if(this.txtTitle == ''){
      this.alertNonInputTxt();
    }else{
      this._indexedDbService.createMstImg(this.createObj(lat, lng, this.txtTitle, this.address));    
      this.changeCenter(lat,lng);
      await this.getMapData(lat,lng);
      this.displayPin();
      infoWindow.close();
    }
  }
  // 地点登録DBオブジェクト生成
  createObj(lat:number, lng:number, tit:string, address:string){
    return { Title: tit, Address:address, Latitude:lat, Longitude:lng };
  }

  /* 情報表示 */
　showInfo() {
    ons.notification.alert({ message: 'LocalWiki等のLOD取得し、この場所の情報やうんちくを表示させたい。', title:'未完成( ;∀;)'  });
  }

  /* 画面遷移系 */
  // TimeTrip画面へ遷移
  goToTimeTrip() {
    if(this.locationID == undefined)
    {
      this.alertNonSelectPin();
    }else{
      this._navigator.nativeElement.pushPage(TimeTrip, { data: { LocationID: this.locationID } });
    }
  }
  // アップロード画面へ遷移
  goToUpload() {
    if(this.locationID == undefined)
    {
      this.alertNonSelectPin();
    }else{
      this._navigator.nativeElement.pushPage(Upload, { data: { LocationID: this.locationID, Address: this.address } });
    }
  }
  /* アラート系 */
  // ピン未選択
  alertNonSelectPin() {
    ons.notification.alert({ message: '閲覧したいピンを選択すると、その地点の情報を確認できます', title:'ピンを選びましょう！' });
  }
  // 地点名未入力
  alertNonInputTxt() {
    ons.notification.alert({ message: 'この地点の名前を入力すると、この地点', title:'地点の名前を入力しましょう！' });
  }
  /* 初期化系メソッド */
  // 入力項目リセット
  resetInput(){
    this.txtTitle = '';
    this.selectedAddresses = '';
    this.addressList = [];
  }
  // ピンマーカーアイコンリセット
  resetPinMarker(){
    var pin = this;
    pin.markers.filter(function(value){
      if(value.iconUrl === pin.markerPinSelected){
        value.iconUrl = pin.markerPinNormal;
      }
    });    
  }
}
// マーカー用インタフェース
interface marker{
  LocationID:number;
  Title:string;
  Address:string;
  Latitude:number;
  Longitude:number;
  iconUrl: string;
}