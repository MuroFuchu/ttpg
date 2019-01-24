import { Component, ViewChild, ElementRef, HostListener, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Menu } from '../menu/menu';
import { Upload } from '../upload/upload';

import * as ons from 'onsenui';
import {
  OnsSelect,
  OnsenModule,
  CUSTOM_ELEMENTS_SCHEMA,
  OnsNavigator,
  Params
} from 'ngx-onsenui';

import { IndexedDbService } from '../../../services/IndexedDbService';
import { LocalLocationInfo, LocalPhotoInfo } from '../../../services/HttpService';

@Component({
  selector: "ons-page[title='timeTrip']",
  templateUrl: './timeTrip.html',
  // styleUrls: ['../src/modules/children/timeTrip/timeTrip.css'],
  styleUrls: ['./timeTrip.css']
})
export class TimeTrip {
  @ViewChild('carousel') carousel: ElementRef;
  @ViewChild('modal') modal: ElementRef;
 
  photoInfo: LocalPhotoInfo = new LocalPhotoInfo();

  isImgErrList: boolean[] = [];
  locationInfoList: LocalLocationInfo[] = [];
  photoInfoAllList: LocalPhotoInfo[] = [];
  photoInfoList: LocalPhotoInfo[] = [];
  location: LocalLocationInfo = new LocalLocationInfo();
  baseDistance: number = 0;
  activeIndex: number = 0;

  photoId: number = 0;
  check: boolean = true;

  isConstructor: boolean = false;

  isVisible = false;
  params = null;

  constructor(private _navigator: OnsNavigator, 
    private _indexedDbService: IndexedDbService, 
    private _params: Params) {
      
    this.isConstructor = true;
  }

  @HostListener('show')
  timeTripShow(e) {
    if(this.isConstructor){
      this.params = this._params.data;
    }else{
      this.params = this._navigator.nativeElement.topPage.data;
    }
    this.init();
  }

  ngAfterViewChecked(){
    if(this.check && this.photoInfoList && this.photoInfoList.length > 0){
      var index = this.photoInfoList.findIndex(s => s.PhotoID == this.photoId);
      var activeIndex = index == -1 ? 0 : index;
      this.carousel.nativeElement.setActiveIndex(activeIndex, { animation: "none" });

      this.check = false;
    }
  }

  async init() {
    this.isVisible = false;

    // 引数を取得
    // console.log(this.params);
    var locationId = this.params.LocationID;
    this.photoId = this.params.PhotoID;
    
    this.photoInfoList = [];
    this.check = true;

    // 位置情報リスト取得
    //console.log(await this._indexedDbService.getMstLocationInfo());
    this.locationInfoList = await this._indexedDbService.getMstLocationInfo();
    if(this.locationInfoList){
      this.location = this.locationInfoList.find(f => f.LocationID == locationId);
      this.isVisible = !this.location ? false : true;
    }

    // 写真情報取得
    await this.setPhotoInfo(locationId, this.photoId);

    // 読み込めなかった写真リスト初期化
    var array = new Array(this.photoInfoList.length);
    this.isImgErrList = this.isImgErrList.fill(false, 0, array.length);

    if(this.photoInfoList.length == 0){
      ons.notification.toast('写真がありません！', { timeout: 1500, animation: 'fall' });
    }

    // var comp = this;
    // this.modal.nativeElement.on("pinchin", (event) => {
    //   console.log("pinchin");
    //   console.log(event);

    //   comp.modal.nativeElement.style.zoom = comp.getDistance(event);
    // });

    // this.modal.nativeElement.on("pinchout", (event) => {
    //   console.log("pinchout");
    //   console.log(event);

    //   comp.modal.nativeElement.style.zoom = comp.getDistance(event);
    // });

    // console.log(this.locationInfoList);
    // console.log(this.location);
    // console.log(this.photoInfoAllList);
    // console.log(this.photoInfoList);
    // console.log(this.photoInfo);
  }

  // カルーセル切り替え時
  toPostChange(event) {
    this.activeIndex = event.activeIndex;
    this.photoInfo = this.photoInfoList[event.activeIndex];
  }

  isPrev(): boolean{
    return this.activeIndex != 0;
  }

  isNext(): boolean{
    return this.photoInfoList.length != 0 && this.activeIndex != this.photoInfoList.length - 1;
  }

  prev(){
    this.carousel.nativeElement.prev();
  }

  next(){
    this.carousel.nativeElement.next();
  }
  
  // メニューに遷移
  goToMenu() {
    this._navigator.nativeElement.resetToPage(Menu);
  }

  // uploadに遷移
  goToUpload() {
    this.isConstructor = false;
    this._navigator.nativeElement.pushPage(Upload, {data: { LocationID: this.location.LocationID, Address: this.location.Address }});
  }

  // 画像拡大モーダルを開く
  openModal(index: number) {
    if (!this.isImgErrList[index]) {
      this.modal.nativeElement.show();
    }
  }

  // カルーセルの初期設定
  private initCrousel(comp: TimeTrip, photoID: number){
    // カルーセルの初期位置設定
    var index = comp.photoInfoList.findIndex(s => s.PhotoID == photoID);
    console.log(index);
    var activeIndex = index == -1 ? 0 : index;
    comp.carousel.nativeElement.refresh();
    comp.carousel.nativeElement.setActiveIndex(activeIndex);
    //this.carousel.nativeElement.setAttribute("initial-index", activeIndex.toString());
  }

  setindex(n: number){
    this.carousel.nativeElement.setActiveIndex(n);
  }

  // 写真情報設定
  private async setPhotoInfo(locationID: number, photoID: number){
    // 時系列写真情報リスト取得
    //console.log(await this._indexedDbService.getTrnPhotoInfo());
    this.photoInfoAllList = await this._indexedDbService.getTrnPhotoInfo();

    // timeTrip情報を設定
    if(this.photoInfoAllList){
      this.photoInfoList = this.photoInfoAllList
        .sort((a, b) => {    // 年の昇順
          if( a.Year < b.Year ) return -1;
          if( a.Year > b.Year ) return 1;
          return 0;
        })
        .filter(f => f.LocationID == locationID);
    }

    // activeな写真情報
    if(this.photoInfoList && this.photoInfoList.length > 0){
      var tempPhotoInfo = this.photoInfoList.find(f => f.PhotoID == photoID);
      this.photoInfo = tempPhotoInfo ? tempPhotoInfo : this.photoInfoList[0];
    }
  }

  // 距離を測る関数
  private getDistance (event) {
	  event.preventDefault();

  	var touches = event.changedTouches;

  	// 2本以上の指の場合だけ処理
  	if ( touches.length > 1 ) {
  		// 座標1 (1本目の指)
  		var x1 = touches[0].pageX;
  		var y1 = touches[0].pageY;

  		// 座標2 (2本目の指)
  		var x2 = touches[1].pageX;
  		var y2 = touches[1].pageY;

  		// 2点間の距離
  		return Math.sqrt( Math.pow( x2-x1, 2 ) + Math.pow( y2-y1, 2 ) ) ;
  	}

  	return 1;
  }
}