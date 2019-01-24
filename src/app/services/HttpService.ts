import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { extend } from 'webdriver-js-extender';
import { IndexedDbService } from './IndexedDbService';
import { promise } from 'protractor';
import { CommaExpr } from '@angular/compiler';

@Injectable()
export class HttpService {

    //private webApiEndPoint = "http://172.16.0.50/TimeTripPhotoGallery.Web/api";
    private webApiEndPoint = "http://test01.nisco.ne.jp/TimeTripPhotoGallery.Web/api";

    constructor(private http: HttpClient, private _indexedDbService: IndexedDbService) {}

    /**
     * DBに登録されている位置情報を取得して返します。
     * @param latitude 現在地の緯度。
     * @param longitude 現在地の経度。
     * @param zoom 検索範囲（GoogleMAPのZoom値）、未指定時は全件。
     */
    async GetLocation(latitude: number, longitude: number, zoom: number): Promise<GetLocationResponseModel> {
        let params = new HttpParams()
            .append("Latitude", String(latitude))
            .append("Longitude", String(longitude))
            .append("Zoom", zoom != null ? String(zoom) : "");

        console.log(`緯度：${latitude}、経度：${longitude}、ズーム：${zoom}`);

        let res = await this.http.get<GetLocationResponseModel>(`${this.webApiEndPoint}/GetLocation`, { params: params }).toPromise();
        
        // 取得成功時ローカルDBを更新する
        if(res.statusCd == StatusCd.success && res.locations.length > 0){
            let locationList: LocalLocationInfo[] = [];
            for(let l of res.locations){
                locationList.push({
                    LocationID: l.locationID,
                    Address: l.address,
                    Latitude: l.latitude,
                    Longitude: l.longitude
                });
            }
            await this._indexedDbService.mergeMultipleLocationInfo(locationList);  
        }

        return {
            statusCd: res.statusCd,
            messages: res.messages,
            locations: res.locations
        };
    }

    /**
     * 新しい位置情報をDBに登録して採番した位置IDを返します。
     * @param title 入力されたタイトル。
     * @param address 位置の住所。
     * @param latitude ピンを立てた位置の緯度。
     * @param longitude ピンを立てた位置の経度
     */
    async AddLocation(title: string, address: string, latitude: number, longitude: number): Promise<AddLocationResponseModel> {
        let params = new HttpParams()
        .append("Title", title)
        .append("Address", address)
        .append("Latitude", String(latitude))
        .append("Longitude", String(longitude));

        var res = await this.http.put<AddLocationResponseModel>(`${this.webApiEndPoint}/AddLocation`, params).toPromise();

        // ローカルDBにInsertする
        if(res.statusCd == StatusCd.success){
            let location: LocalLocationInfo = {
                LocationID: res.locationID,
                Address: address,
                Latitude: latitude,
                Longitude: longitude
            }
            await this._indexedDbService.addOneLocationInfo(location);
        }

        return {
            statusCd: res.statusCd,
            messages: res.messages,
            locationID: res.locationID
        };
    }

    /**
     * DBに登録されている写真情報を取得して返します。
     * @param locationID 取得したい写真の位置を特定するキー。
     * @param photoID 取得したい写真を特定するキー、未指定時はすべての写真が対象となる。
     */
    async GetPhoto(locationID: number, photoID: number): Promise<GetPhotoResponseModel> {
        let params = new HttpParams()
            .append("LocationID", String(locationID))
            .append("PhotoID", photoID != null ? String(photoID) : "");

        var res = await this.http.get<GetPhotoResponseModel>(`${this.webApiEndPoint}/GetPhoto`, { params: params }).toPromise();

        // 取得成功時ローカルDBを更新する
        if(res.statusCd == StatusCd.success && res.photos.length > 0){
            let photoList: LocalPhotoInfo[] = [];
            for(let p of res.photos){
                photoList.push({
                    PhotoID: p.photoID,
                    LocationID: locationID,
                    Year: p.year,
                    Comment: p.comment,
                    Bin:  decodeURIComponent(p.bin)
                });
            }
            await this._indexedDbService.mergeMultiplePhotoInfo(photoList);
        }

        return {
            statusCd: res.statusCd,
            messages: res.messages,
            photos: res.photos   
        };
    }
    
    /**
     * 新しい写真情報をDBに登録して採番した位置IDを返します。
     * @param year 入力された年。
     * @param locationID 追加する写真の位置を識別するキー。
     * @param comment 入力されたコメント。
     * @param bin 写真のバイナリデータ。
     */
    async AddPhoto(year: number, locationID: number, comment: string, bin: string): Promise<AddPhotoResponseModel> {
        let params = new HttpParams()
            .append("Year", String(year))
            .append("LocationID", String(locationID))
            .append("Comment", comment)
            .append("Bin", encodeURIComponent(bin));
        let headers = new HttpHeaders().set('Authorization', `Bearer ${''}`);

        let res = await this.http.put<AddPhotoResponseModel>(`${this.webApiEndPoint}/AddPhoto`, params, {headers: headers}).toPromise();
        
        // ローカルDBにInsertする
        if(res.statusCd == StatusCd.success){
            let photo: LocalPhotoInfo = {
                PhotoID: res.photoID,
                LocationID: locationID,
                Year: year,
                Comment: comment,
                Bin: bin
            }
            await this._indexedDbService.addOnePhotoInfo(photo);
        }

        return {
            statusCd: res.statusCd,
            messages: res.messages,
            photoID: res.photoID
        };
    }    
}

//#region 型定義情報

/**
 * TimeTripPhotoGalleryのサーバ側の処理の結果を表します。
 */
export enum StatusCd {
    /**
     * 処理が正常に終了したことを表します。
     */
    success = "0",
    /**
     * 要求パラメータ等の検証を行った結果、エラーがあったことを表します。
     */
    validationError = "101"
}

/**
 * TimeTripPhotoGalleryで使用する形式に加工した位置情報。
 */
export class LocationModel {
    /**
     * 位置情報を特定するためのキー。
     */
    locationID: number;
    /**
     * 登録時に入力されたタイトル。
     */
    title: string;
    /**
     * 位置情報の住所。
     */    
    address: string;
    /**
     * 位置情報の緯度。
     */    
    latitude: number;
    /**
     * 位置情報の経度。
     */    
    longitude: number;
    /**
     * 現在地から見た位置情報までの距離（メートル）。
     */    
    distance: number;
}

/**
 * TimeTripPhotoGalleryで使用する形式に加工した写真情報。
 */
export class PhotoModel {
    /**
     * 写真情報を特定するためのキー。
     */
    photoID: number;    
    /**
     * 写真の年。
     */
    year: number;
    /**
     * 写真のコメント。
     */
    comment: string;
    /**
     * 写真のバイナリ情報（DataURI形式）。
     */
    bin: string;
}

//#endregion

//#region 応答パラメータ

/**
 * 応答パラメータモデル。
 */
export class HttpResponseModel {
    statusCd: StatusCd;
    messages: string[];
}

/**
 * GetLocationの応答パラメータモデル。
 */
export class GetLocationResponseModel extends HttpResponseModel {
    locations: LocationModel[];
}

/**
 * AddLocationの応答パラメータモデル。
 */
export class AddLocationResponseModel extends HttpResponseModel {
    locationID: number;
}

/**
 * GetPhotoの応答パラメータモデル。
 */
export class GetPhotoResponseModel extends HttpResponseModel {
    photos: PhotoModel[];
}

/**
 * AddPhotoの応答パラメータモデル。
 */
export class AddPhotoResponseModel extends HttpResponseModel {
    photoID: number;
}

//#endregion

//#region localDBの型定義情報
export class LocalLocationInfo {
    LocationID: number;
    Address: string;
    Latitude: number;
    Longitude: number;
  }
  
export class LocalPhotoInfo {
  PhotoID: number;
  Year: number;
  LocationID: number;
  Comment: string;
  Bin: string;
}
//#endregion