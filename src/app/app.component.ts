import { OnInit, Component , Injectable } from '@angular/core';
import * as ons from 'onsenui';

import { Menu } from './modules/children/menu/menu';
import { IndexedDbService } from './services/IndexedDbService';
import { GetJsonService } from './services/GetJsonService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private indexedDbService: IndexedDbService, private getJsonService:GetJsonService) {}

  async ngOnInit() {
    
    var flg = await this.CheckInitData();

    if(flg) {
      console.log('データ初期化するよ');
      //var MstLocationInfo = await this.getJsonService.GetJson('MstLocation').toPromise();
      //console.log(MstLocationInfo);
      //this.indexedDbService.addMultipleLocationInfo(MstLocationInfo);
      
      //var TrnPhotoInfo = await this.getJsonService.GetJson('TrnPhoto').toPromise();
      //console.log(TrnPhotoInfo);
      //this.indexedDbService.addMultiplePhotoInfo(TrnPhotoInfo);
      this.indexedDbService.cheakedInitData();
    }
    
  }

  async CheckInitData() {
    var ret = await this.indexedDbService.cheakInitData();

    return ret;
  } 

  initialPage = Menu;
}
