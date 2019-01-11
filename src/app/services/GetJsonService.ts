import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class GetJsonService {
    constructor(private http: HttpClient) {}

    GetJson(fileName: string):Observable<any> {
        var url = `./assets/initData/${fileName}.json`;
        return this.http.get(url);
    }

}