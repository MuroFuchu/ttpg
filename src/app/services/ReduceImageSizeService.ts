import { Injectable } from '@angular/core';

/**
 * 画像ファイルサイズ削減サービス
 */
@Injectable()
export class ReduceImageSizeService {
    
    /**
     * 画像ファイルサイズ削減
     * @param target 対象
     */
    reduceImageSize(target: File, size: number): Promise<FileInfo> {
        var info = this.ConvertFileInfo(target);

        var comp = this;

        const p1 = new Promise<FileInfo>((resolve, reject) => {
            // 画像ファイル以外は処理中止
            if (!target.type || target.type.trim() == '' || !target.type.match(/^image\/.*$/)) {
                resolve(info);
            }

            try {
                var image = new Image();
                var reader = new FileReader();

                reader.onloadend = function () {
                    image.onload = function () { // 画像が読み込めた時の処理
                        // canvasの要素を生成
                        var canvas = document.createElement("canvas");

                        // 2次元コンテキストを取得
                        var ctx = canvas.getContext('2d');
                        // 縮小する割合を指定
                        var scale = (size / target.size) * Math.sqrt(2);

                        var imageWidth = Math.round(image.width * scale);
                        var imageHeight = Math.round(image.height * scale);

                        canvas.width = imageWidth;
                        canvas.height = imageHeight;

                        // 画像imageのサイズを縮小する
                        // drawImage(画像, x座標, y座標, 幅, 高さ)で画像サイズを変更
                        ctx.clearRect(0, 0, imageWidth, imageHeight);
                        ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
                        
                        var base64 = canvas.toDataURL(target.type);
                        var tmp = base64.split(',');
                        if (!tmp[1]) {
                            resolve(info);
                        }

                        // base64データの文字列をデコード
                        var data = atob(tmp[1]);
                        // tmp[0]の文字列（data:image/png;base64）からコンテンツタイプ（image/png）部分を取得
                        var mime = tmp[0].split(':')[1].split(';')[0];
                        //  1文字ごとにUTF-16コードを表す 0から65535 の整数を取得

                        var buf = new Uint8Array(data.length);
                        for (var i = 0; i < data.length; i++) {
                            buf[i] = data.charCodeAt(i);
                        }
                        info.fileDataUrl = base64;
                        info.fileSize = buf.byteLength;

                        // IE 非対応
                        //var ret: File = new File([buf], target.name, { type: target.type });

                        resolve(info);
                    }
                    image.src = reader.result;
                }
                reader.readAsDataURL(target);
            }
            catch(e) {
                reject(info);
            }
                
        }).then(
            // Promiseが成功したとき
            (value: FileInfo) => { // 引数valueの型はProcese<T>のT型
                return value;
            }
        ).catch(
            // Promiseが失敗したとき
            (reason: any) => {
                return info;
            }
        );

        return p1;
    }

    ConvertFileInfo(target: File): FileInfo {
        var ret = new FileInfo();
            
        var reader = new FileReader();

        var comp = this;
        reader.onloadend = function () {
            ret.fileDataUrl = reader.result;
            ret.fileName = target.name;
            ret.fileSize = target.size;
            ret.fileType = target.type;

            return ret;
        }
        reader.readAsDataURL(target);

        return ret;
    }

    readDataUrl(blob): Promise<string> {
        var fr = new FileReader()
        var pr = new Promise<string>((resolve, reject) => {
            fr.onload = eve => {
                resolve(fr.result)
            }
            fr.onerror = eve => {
                reject(fr.error)
            }
        })

        fr.readAsDataURL(blob)
        return pr
    }
}

export class FileInfo {
    //ファイル名
    public fileName: string;
    //ファイルタイプ
    public fileType: string;
    //ファイル内容
    public fileDataUrl: string;
    //ファイルサイズ
    public fileSize?: number;

}