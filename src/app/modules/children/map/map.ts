import * as ons from 'onsenui';
import {Upload} from '../upload/upload';
import {TimeTrip} from '../timeTrip/timeTrip';
import {OnsNavigator,OnsenModule,Params} from 'ngx-onsenui' ;
import {Component, NgZone, Injectable, OnInit, EventEmitter} from '@angular/core';
import {MapsAPILoader,GoogleMapsAPIWrapper, MouseEvent, AgmMap, AgmMarker, AgmInfoWindow } from '@agm/core';
import {IndexedDbService} from '../../../services/IndexedDbService';//ﾃﾞｭｸｼ
import {HttpService, StatusCd} from '../../../services/HttpService';//HTTPｻｰﾋﾞｽ
import {GoogleMapsAPIWrapperEx} from '../../../services/GoogleMapsAPIWrapperEx';//ｸﾞｰｸﾞﾙ

@Component({
  selector: "ons-page[title='map']",
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})

export class Map implements OnInit {
  // #region 共通変数
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
  markerPinNormal: string = './assets/contents/icons/pin_normal.svg';
  markerPinSelected: string = './assets/contents/icons/pin_free.svg';
  nowPlacePin: string = './assets/contents/icons/pin_nowPlace.svg';
  iconPathInfo: string = './assets/contents/buttons/showInfo.png';
  iconPathTrip: string = './assets/contents/buttons/goToTrip.png';
  iconPathRegist: string = './assets/contents/buttons/goToRegist.png';
  iconPathRegist2: string = 'src/';
  addressList:any[];
  // #endregion

  constructor(private _navigator: OnsNavigator, private _httpService: HttpService, private _googleMapsAPIWrapperEx: GoogleMapsAPIWrapperEx, private _params: Params) {}

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

  // #region 現在地を取得する
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
  // #endregion

  // #region ◆表示系◆
  // #region 画面にピンを表示する
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
  // #endregion
  // #region ダブルタップした地点の情報を登録するための情報を取得する
  async dblClickMap($event: MouseEvent){
    this.lastOpenWindow = this;
    this.resetInput();
    this.lastClicklat = $event.coords.lat;
    this.lastClicklng = $event.coords.lng;
    this.addressList = await this._googleMapsAPIWrapperEx.getAddress(this.lastClicklat, this.lastClicklng);//座標から住所を取得する
    this.address = this.addressList[0].formatted_address;
  }
  // #endregion
  // #region タップした地点の情報を取得する
  clickMarker(m: marker){
    this.lastOpenWindow = this;
    this.locationID = m.LocationID;
    this.address = m.Address;
    this.resetPinMarker();//ピンマーカーをすべて初期化する
    m.iconUrl = this.markerPinSelected;
    this.selectedMarkerPin = m.iconUrl;// 新しいアイコン情報を取得する
    this.changeCenter(m.Latitude,m.Longitude);
  }
  // #endregion
  // #region 指定した座標を中心にする
  changeCenter(lat:number, lng:number){
    this.centerLat = lat;
    this.centerLng = lng;
  }
  // #endregion
  // #endregion

  // #region ◆DBアクセス系◆
  // #region データ取得
  async getMapData(lat:number, lng:number){
    //var data = await this._indexedDbService.getMstLocationByRange(lat,lng);
    var data = await this._httpService.GetLocation(lat, lng, null).toPromise();
    if(data.statusCd == StatusCd.success){
      console.log('データ取得完了');
      data.locations.forEach(data => {
        this.markers.push(
          { LocationID:data.locationID,
            Title:data.title,
            Address:data.address,
            Latitude:data.latitude,
            Longitude:data.longitude,
            iconUrl:this.markerPinNormal
          }
        );
      });
    }else{
      console.log('データが取得できなかった');
      this.markers = [];
    }
  }
  // #endregion
  // #region 地点登録
  async registMapMst(lat:number, lng:number, infoWindow){
    var address;
    address = this._googleMapsAPIWrapperEx.getAddress(lat, lng);
    if(this.txtTitle == ''){
      this.alertNonInputTxt();
    }else{
      var ret = await this._httpService.AddLocation(this.txtTitle, this.address, lat, lng).toPromise();
      // this._indexedDbService.createMstImg(this.createObj(lat, lng, this.txtTitle, this.address));    
      this.changeCenter(lat,lng);
      await this.getMapData(lat,lng);
      this.displayPin();
      infoWindow.close();
    }
  }
  // #endregion
  // #endregion
 
  // #region ◆地点登録DBオブジェクト生成◆
  createObj(lat:number, lng:number, tit:string, address:string){
    return { Title: tit, Address:address, Latitude:lat, Longitude:lng };
  }
  // #endregion

  // #region ◆画面遷移系◆
  // #region TimeTrip画面へ遷移
  goToTimeTrip() {
    if(this.locationID == undefined)
    {
      this.alertNonSelectPin();
    }else{
      this._navigator.nativeElement.pushPage(TimeTrip, { data: { LocationID: this.locationID } });
    }
  }
  // #endregion
  // #region アップロード画面へ遷移
  goToUpload() {
    if(this.locationID == undefined)
    {
      this.alertNonSelectPin();
    }else{
      this._navigator.nativeElement.pushPage(Upload, { data: { LocationID: this.locationID, Address: this.address } });
    }
  }
  // #endregion
  // #endregion

  // #region ◆アラート系◆
  // #region ピン未選択
  alertNonSelectPin() {
    ons.notification.alert({ message: '閲覧したいピンを選択すると、その地点の情報を確認できます', title:'ピンを選びましょう！' });
  }
  // #endregion
  // #region 地点名未入力
  alertNonInputTxt() {
    ons.notification.alert({ message: 'この地点がどこなのか分かる地点名を入力しましょう', title:'地点の名前を入力しましょう！' });
  }
  // #endregion
  // #region 情報表示
　showInfo() {
    ons.notification.alert({ message: 'LocalWiki等のLOD取得し、この場所の情報やうんちくを表示させたい。', title:'未完成( ;∀;)'  });
  }
  // #endregion
  // #endregion

  // #region ◆初期化系◆
  // #region 入力項目リセット
  resetInput(){
    this.txtTitle = '';
    this.selectedAddresses = '';
    this.addressList = [];
  }
  // #endregion
  // #region ピンマーカーアイコンリセット
  resetPinMarker(){
    var pin = this;
    pin.markers.filter(function(value){
      if(value.iconUrl === pin.markerPinSelected){
        value.iconUrl = pin.markerPinNormal;
      }
    });    
  }
  // #endregion
  // #endregion
}

// #region ◆インタフェース◆
// #region マーカー用インタフェース
interface marker{
  LocationID:number;
  Title:string;
  Address:string;
  Latitude:number;
  Longitude:number;
  iconUrl: string;
}
// #endregion
// #endregion