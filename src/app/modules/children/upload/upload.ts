import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/HttpService';
import { ReduceImageSizeService } from 'src/app/services/ReduceImageSizeService';
import { OnsNavigator, Params } from 'ngx-onsenui';
import { TimeTrip } from '../timeTrip/timeTrip';
import { Menu } from '../menu/menu';

import * as ons from 'onsenui';

@Component({
  selector: "ons-page[title='upload']",
  templateUrl: './upload.html',
  styleUrls: ['./upload.html']
})
export class Upload {

  photoLocationID: number = 0;
  photoID: number = 0;
  photoYear: number = 0;

  photoAddress: string = '';
  photoComment: string = '';
  inputAccept: string = '';

  binary;

  constructor(private _navigator: OnsNavigator, private _httpService: HttpService, private _params: Params, private _reduceImageSizeService: ReduceImageSizeService) {}

  async ngOnInit() {

    // パラメタ取得
    this.photoLocationID = this._params.data.LocationID;
    this.photoAddress = this._params.data.Address;

    // 年初期値
    this.photoYear = new Date().getFullYear();

    // Element情報設定
    this.inputAccept = "image/*";

  }

  //#region 公開処理

  // ファイル選択ボタン
  public async changePhoto(event)
  {
    let size = 1024 * 300;
    let files: File[] = event.target.files;
    let file: File = files[0];

    var imgElem: HTMLImageElement = document.getElementById('photoPreview') as HTMLImageElement;
    if (file.size != null && file.size > size) {
      console.log("changePhotoStart --reduce");
      let fileInfo = await this._reduceImageSizeService.reduceImageSize(file, size);
      imgElem.src = fileInfo.fileDataUrl;
      console.log("fileInfoEnd --reduce");
    }else{
      console.log("changePhotoStart --normal");
      imgElem.src = await this._reduceImageSizeService.readDataUrl(file);
      console.log("fileInfoEnd --normal");
    }

    // var fileReader = new FileReader();
    // fileReader.onload = function() {
    //   console.log("3.画像ロードStart");
    //   var imgElem: HTMLImageElement = document.getElementById('photoPreview') as HTMLImageElement;
    //   // var a = new Uint8Array(fileReader.result);
    //   // imgElem.src = "data:image/jpeg;base64," + a;
    //   var b64 = btoa(fileReader.result.toString());
    //   imgElem.src = "data:image/jpeg;base64," + b64;
    //   console.log("4.画像ロードOK");
    // }

    // console.log("2.readBinaryStart");
    // fileReader.readAsBinaryString(file);
    // //fileReader.readAsArrayBuffer(file);
  }

  // 写真アップロード
  public uploadPhotoConfirm()
  {

    if (this.errorCheck() == false)
    {
      return;
    }

    ons.notification.confirm({
      title: "確認",
      message: "写真をアップロードしますか？",
      cancelable: true,
      callback: i => {
        if (i == 1) {
          this.uploadPhoto();
        }
      }
    });
  }

  // ホームへ戻る
  public goToHome(){
    this._navigator.nativeElement.resetToPage(Menu);
  }

//#endregion

//#region 非公開処理

  // 写真情報DB登録処理
  private async uploadPhoto()
  {
    try{
      var imgElem: HTMLImageElement = document.getElementById('photoPreview') as HTMLImageElement;
      var photoInfo: TimeTripPhotoInfo = null;

      photoInfo = new TimeTripPhotoInfo()
      photoInfo.Year = Number(this.photoYear);
      photoInfo.LocationID = Number(this.photoLocationID);
      photoInfo.Comment = this.photoComment;
      photoInfo.Bin = imgElem.src;

      var photo = await this._httpService.AddPhoto(Number(this.photoYear), Number(this.photoLocationID), this.photoComment, imgElem.src);
      this.photoID = photo.photoID;

      console.log('AddPhoto' + this.photoID)
 
      ons.notification.alert({
        title: 'ありがとう！',
        message: '素敵な写真ですね！',
        callback: i => {
          ons.notification.toast('写真が更新されたよ！', { timeout: 1500, animation: 'fall' });
          this.pageChange();
        }
      });

    } catch (error) {
      console.log(error);
      return;
    }
  }

  // アップロード後の画面遷移
  private async pageChange() {
    var p = this._navigator.nativeElement.pages.filter((page) => { return page.title == 'timetrip'; });
    if(p.length > 0) {
      // TimeTripページ経由であれば、１つ前の画面（TimeTripページ）に戻る
      this._navigator.nativeElement.popPage({data: { LocationID: this.photoLocationID, PhotoID: this.photoID}});
    } else {
      // TimeTripページを経由していなければ、新たにTimeTripページを開く
      this._navigator.nativeElement.replacePage(TimeTrip, {data: { LocationID: this.photoLocationID, PhotoID: this.photoID}});
    }
  }

  // エラーチェック
  private errorCheck()
  {
    var imgElem: HTMLImageElement = document.getElementById('photoPreview') as HTMLImageElement;
    if (imgElem.src == "")
    {
      ons.notification.alert({title: 'お願い', message: 'アップロードする写真を選んでね！'})
      return false;
    }

    if (!this.photoYear)
    {
      ons.notification.alert({title: 'お願い', message: 'いつの写真か入力してね！'})
      return false;
    };

    if (isNaN(this.photoYear) == true)
    {
      ons.notification.alert({title: 'お願い', message: 'いつの写真かは数値で入力してね！'})
      return false;
    }

    return true;
  }

//#endregion

}

class TimeTripPhotoInfo {
  PhotoID: number;
  Year: number;
  LocationID: number;
  Title: string;
  Comment: string;
  Bin: string;
  LastUpdateDate: string;
}
