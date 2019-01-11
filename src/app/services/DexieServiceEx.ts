import {Injectable} from '@angular/core';
import {DexieService} from './ngx-dexie';
import {DexieDatabase} from './ngx-dexie/dexie.database';

@Injectable()
export class DexieServiceEx extends DexieService {
    constructor(private _db: DexieDatabase) {
        super(_db);
    }

    where(table : string,index: string | string[]){
        return this._db.table(table).where(index);
    }

    deleteDataBase() {
        this._db.delete();
    }

}