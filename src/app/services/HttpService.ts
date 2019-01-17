import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { extend } from 'webdriver-js-extender';

@Injectable()
export class HttpService {
    private webApiEndPoint = "http://172.16.0.50/TimeTripPhotoGallery.Web/api";

    constructor(private http: HttpClient) {}

    /**
     * DBに登録されている位置情報を取得して返します。
     * @param latitude 現在地の緯度。
     * @param longitude 現在地の経度。
     * @param zoom 検索範囲（GoogleMAPのZoom値）、未指定時は全件。
     */
    GetLocation(latitude: number, longitude: number, zoom: number): Observable<GetLocationResponseModel> {
        let params = new HttpParams()
            .append("Latitude", String(latitude))
            .append("Longitude", String(longitude))
            .append("Zoom", String(zoom));

        return this.http.get<GetLocationResponseModel>(`${this.webApiEndPoint}/GetLocation`, { params: params });
    }

    /**
     * 新しい位置情報をDBに登録して採番した位置IDを返します。
     * @param title 入力されたタイトル。
     * @param address 位置の住所。
     * @param latitude ピンを立てた位置の緯度。
     * @param longitude ピンを立てた位置の経度
     */
    AddLocation(title: string, address: string, latitude: number, longitude: number): Observable<any> {
        let params = new HttpParams()
        .append("Title", title)
        .append("Address", address)
        .append("Latitude", String(latitude))
        .append("Longitude", String(longitude));

        //return this.http.put<AddLocationResponseModel>(`${this.webApiEndPoint}/AddLocation`, params);
        return this.http.put<any>(`${this.webApiEndPoint}/AddLocation`, params);
    }

    /**
     * DBに登録されている写真情報を取得して返します。
     * @param locationID 取得したい写真の位置を特定するキー。
     * @param photoID 取得したい写真を特定するキー、未指定時はすべての写真が対象となる。
     */
    GetPhoto(locationID: number, photoID: number): Observable<GetPhotoResponseModel> {
        let params = new HttpParams()
            .append("LocationID", String(locationID))
            .append("PhotoID", String(photoID));

        return this.http.get<GetPhotoResponseModel>(`${this.webApiEndPoint}/GetPhoto`, { params: params });
    }
    
    /**
     * 新しい写真情報をDBに登録して採番した位置IDを返します。
     * @param year 入力された年。
     * @param locationID 追加する写真の位置を識別するキー。
     * @param comment 入力されたコメント。
     * @param bin 写真のバイナリデータ。
     */
    AddPhoto(year: number, locationID: number, comment: string, bin: string): Observable<AddPhotoResponseModel> {
        let params = new HttpParams()
            .append("Year", String(year))
            .append("LocationID", String(locationID))
            .append("Comment", comment)
            .append("Bin", encodeURIComponent(bin));

        return this.http.put<AddPhotoResponseModel>(`${this.webApiEndPoint}/AddPhoto`, params);
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
