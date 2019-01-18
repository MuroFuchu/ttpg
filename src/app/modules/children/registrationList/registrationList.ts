import {Component} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import * as ons from 'onsenui';
import {OnsNavigator,OnsenModule,Params} from 'ngx-onsenui' 

import {TimeTrip} from '../timeTrip/timeTrip';

import {IndexedDbService} from '../../../services/IndexedDbService';
import {HttpService, StatusCd, PhotoModel} from '../../../services/HttpService';

@Component({
  selector: "ons-page[title='registrationList']",
  templateUrl: './registrationList.html',
  styleUrls: ['./registrationList.css']
})
export class RegistrationList {
  RegistrationLists: RegistrationInfo[] = [];
  isVisible = false;

  constructor(private _navigator: OnsNavigator, 
    private _indexedDbService: IndexedDbService, 
    private _httpService: HttpService, 
    private _params: Params,
    private _domSanitizer: DomSanitizer) {}

  async ngOnInit() {
    this.getRegistList();
  }
  
  async getRegistList(){
    // paramsから緯度経度を取得
    var presentLat = this._params.data.PresentLat;
    var presentLng = this._params.data.PresentLng;
    if (!presentLat || !presentLng) {
      ons.notification.alert({ message: '地点情報を取得できるように設定してからご使用くださいね！', title:'現在地が取得できませんでした'});
      return;
    }

    // DBから位置情報一覧を取得
    var location = await this._httpService.GetLocation(presentLat, presentLng, 15);
    if (location.statusCd != StatusCd.success){
      //ons.notification.alert({ messageHTML: `ステータスコード：${location.statusCd}<br>location.messages.join()`, title:'エラー'});
      return;
    }

    this.isVisible = false;
    for(let l of location.locations){
      // DBから写真一覧を取得
      let photo = await this._httpService.GetPhoto(l.locationID, null);
      if(photo.statusCd != StatusCd.success){
        continue;
      }

      for(let p of photo.photos){
        // 表示用リストに追加
        this.RegistrationLists.push({
          PhotoID: p.photoID,
          Year: p.year,
          LocationID: l.locationID,
          Title: l.title,
          Comment: p.comment,
          Bin: decodeURIComponent(p.bin)//p.bin.replace(/\s+/g, "")
        });
      }
    }
    this.isVisible = true;
  }
  
  // 写真をタップした時のイベント
  clickPhoto(_locatonID:number, _photoId:number){
    this._navigator.nativeElement.pushPage(TimeTrip, {data: {PhotoID: _photoId , LocationID:_locatonID}});
    console.log('クリックしたLocationID' + _locatonID);
    console.log('クリックしたPhotoId' + _photoId);
  }

  sanitize(url:string){
    return this._domSanitizer.bypassSecurityTrustUrl(url);
  }

}

class RegistrationInfo {
  PhotoID: number;
  Year: number;
  LocationID: number;
  Title: string;
  Comment: string;
  Bin: string;
  //LastUpdateDate: string;
}
