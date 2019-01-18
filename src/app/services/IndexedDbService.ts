import {Injectable} from '@angular/core';
import {DexieService} from 'ngx-dexie';
import {DexieServiceEx} from './DexieServiceEx';

@Injectable()
export class IndexedDbService {
 // https://www.npmjs.com/package/ngx-dexie
    constructor(private dexieService: DexieServiceEx) {}

    private readonly flg : string = '1';
    private readonly CheakInitData : string = 'CheakInitData';
    private readonly MstLocationInfo : string = 'MstLocationInfo';
    private readonly TrnPhotoInfo : string = 'TrnPhotoInfo';
    
    public async cheakInitData() {
        var data = null;
        await this.dexieService.getByPrimaryKey(this.CheakInitData, this.flg, (item) => {
            data = item;
        });
        
        if(data){          
          return false;
        }
        
        return true;
    }

    public cheakedInitData() {
        this.dexieService.addOne(this.CheakInitData,{"ID":this.flg});
    }

    public addMultipleLocationInfo(locationInfoObjects: Object[]) {
        this.dexieService.addMultiple(this.MstLocationInfo,locationInfoObjects);
    }

    public mergeMultipleLocationInfo(locationInfoObjects: Object[]){
        this.dexieService.addOrUpdateMultiple(this.MstLocationInfo,locationInfoObjects);
    }

    public async addOneLocationInfo(LocationInfoObject: Object) {
        var result = await this.dexieService.addOne(this.MstLocationInfo,LocationInfoObject);
        return result;
     }

    public async addOnePhotoInfo(photoInfoObject: Object) {
       var result = await this.dexieService.addOne(this.TrnPhotoInfo,photoInfoObject);
       return result;
    }

    public addMultiplePhotoInfo(photoInfoObjects: Object[]) {
        this.dexieService.addMultiple(this.TrnPhotoInfo,photoInfoObjects);
    }

    public mergeMultiplePhotoInfo(photoInfoObjects: Object[]) {
        this.dexieService.addOrUpdateMultiple(this.TrnPhotoInfo,photoInfoObjects);
    }    

    public async getTrnPhotoInfoByKey(key: string) {
        var data = null;
        await this.dexieService.getByPrimaryKey(this.TrnPhotoInfo, key, (item) => {
            data = item;
        });

        return data;
    }

    public async countLocationInfo() {
        return await this.dexieService.count(this.MstLocationInfo);
    }

    // 位置情報マスタ全件取得
    public async getMstLocationInfo(){
        return await this.dexieService.toArray(this.MstLocationInfo);
    }

    // 登録されている画像を全取得する
    public async getTrnPhotoInfo() {
        return await this.dexieService.toArray(this.TrnPhotoInfo);
    }

    // 指定した座標付近のマスタを取得する
    public async getMstLocationByRange(latitude:number, longitude:number){
        var half:number = 0.015;
        var data = await this.dexieService
            .where(this.MstLocationInfo,'Latitude').between(latitude-half,latitude+half)
            .and((data) => {
                return longitude-half <= data.Longitude && data.Longitude <= longitude+half;
            })
        return data.toArray();
    }

    public deleteDatabase() {
        this.dexieService.deleteDataBase();
    }

    public deleteAllMstLocationInfo(){
        this.dexieService.clearAll(this.MstLocationInfo);
    }

    public deleteAllTrnPhotoInfo(){
        this.dexieService.clearAll(this.TrnPhotoInfo);
    }

    public deleteMstLocationInfoMutiple(keys: number[]) {
        this.dexieService.deleteMultiple(this.MstLocationInfo, keys);
    }

    public deleteTrnPhotoInfoMutiple(keys: number[]) {
        this.dexieService.deleteMultiple(this.TrnPhotoInfo, keys);
    }

    // 画像をマスタ登録する
    public createMstImg(locationInfoObjects: Object){
        this.dexieService.addOne(this.MstLocationInfo, locationInfoObjects);       
    }
}