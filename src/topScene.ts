import Phaser from 'phaser';
import {createConfig} from "./define.ts";


/**
 * トップシーン
 */
export class TopScene extends Phaser.Scene {
    
    public static Key = 'topScene';
    
    /**
     * コンストラクタ
     */
    constructor() {
        super(TopScene.Key);
        console.log('topScene constructor');
    }
    
    /**
     * プリロード
     */
    preload() {
        console.log('topScene preload');

        // サンプルで画像をロード
        this.load.image('eye', './textures/textures00/lookingatyou.png');
    }
    
    /**
     * ゲームオブジェクト初期化
     */
    create() {
        console.log('topScene create');

        const canvas = this.game.canvas;

        // 画像
        this.add.image(canvas.width/2, canvas.height/2, 'eye');

        // テキスト
        const text = this.add.text(0, 0, "SimpleChatCharacter", {fontSize: 30});
        text.setOrigin(0.5, 0.5);
        text.setFill('#ffffff');
        text.setPosition(canvas.width/2, canvas.height/2 + 200);
    }
}

new Phaser.Game(createConfig([TopScene]));