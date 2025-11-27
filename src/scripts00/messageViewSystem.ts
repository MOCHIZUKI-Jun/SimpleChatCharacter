import {InputFieldView} from "./inputFieldView.ts";
import {MessageView} from "./messageView.ts";
import {TEXT_SIZE} from "./define.ts";
import {MOBILE_SCREEN_SIZE} from "../define.ts";
import {GetColorCodeByRGB} from "../utility/colorUtility.ts";
import {tweenAsync} from "../utility/tweenAsync.ts";
import {SimpleMessageArgInterface, SimpleMessageBroker} from "../utility/simpleMessageBroker.ts";
import {SimpleDisposableInterface} from "../utility/simpleDisposableInterface.ts";

export interface ApiClientInterface {
  request(message: string): Promise<string>;
}

/**
 * APIレスポンス受け取り時ブローカ
 */
export class SystemMessageArgOnReplyReceived
  implements SimpleMessageArgInterface
{
  public static readonly KEY = "SystemMessageArgOnReplyReceived";
  public readonly mappingKey = SystemMessageArgOnReplyReceived.KEY;

  public readonly response: string;
  constructor(response: string) {
    this.response = response;
  }
}

/**
 * メッセージ表示システム
 */
export class MessageViewSystem {
  
  private readonly scene!: Phaser.Scene;
  private readonly messageBroker: SimpleMessageBroker;
  private readonly inputFieldView!: InputFieldView;
  private readonly apiClient!: ApiClientInterface;
  
  private leftMessageViews: MessageView[] = [];
  private rightMessageViews: MessageView[] = [];
  private showingMessageViews: MessageView[] = [];
  
  private readonly disposables: SimpleDisposableInterface[] = [];
  
  constructor(
    scene: Phaser.Scene,
    messageBroker: SimpleMessageBroker,
    inputFieldView: InputFieldView,
    apiClient: ApiClientInterface,
  ) {
    this.scene = scene;
    this.messageBroker = messageBroker;
    this.inputFieldView = inputFieldView;
    this.apiClient = apiClient;
    
    this.createMessageViews(scene);
    
    // 入力確定時イベント
    this.inputFieldView.textInputField.onTextFixed.subscribe((text: string) => {
      this.inputFieldView.textInputField.clearField();
      this.addMessageAsync(text, false).then();
      this.requestAsync(text).then();
    });
    
    // レスポンス受信時イベント
    this.disposables.push(
      this.messageBroker.subscribe(SystemMessageArgOnReplyReceived.KEY, (a) => {
        const arg = a as SystemMessageArgOnReplyReceived;
        const response = arg.response;
        this.addMessageAsync(response, true).then();
      })
    );
  }
  
  public dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
  
  /**
   * リクエスト
   */
  private async requestAsync(message: string) {
    const response = await this.apiClient.request(message);
    this.messageBroker.publish(new SystemMessageArgOnReplyReceived(response));
  }
  
  /**
   * メッセージ追加
   */
  private async addMessageAsync(message: string, isLeft: boolean) {
    let view: MessageView | undefined = undefined;
    if (isLeft) {
      view = this.leftMessageViews.find((mv) => !mv.visible);
    } else {
      view = this.rightMessageViews.find((mv) => !mv.visible);
    }
    
    if (view == undefined) return;
    
    // メッセージセット
    const viewHeight = view.setText(message);
    
    const canvas = view.scene.game.canvas;
    const canvasHeight = canvas.height;
    const beginPosY = canvasHeight;
    
    // 初期位置セット
    view.setY(beginPosY);
    
    // 移動量
    const moveAmountY = viewHeight;
    
    const tasks: Promise<void>[] = [];
    
    // 表示
    this.showingMessageViews.push(view);
    view.setVisible(true);
    view.setAlpha(0);
    
    // 既存の表示メッセージを上に移動
    for (const sv of this.showingMessageViews) {
      const t =  tweenAsync(
        this.scene,
        {
          targets: sv,
          y: `-=${moveAmountY}`,
          alpha: 1,
          duration: 300,
          ease: "Sine.easeInOut",
        }).then();
      tasks.push(t);
    }
    
    // 規定以上の表示がある場合はフェードアウト
    const fadeoutViews: MessageView[] = [];
    if (this.showingMessageViews.length > 2) {
      // 先頭を取得
      const firstView = this.showingMessageViews.shift();
      if (firstView != undefined) fadeoutViews.push(firstView);
    }
    
    for (const sv of fadeoutViews) {
      const t =  tweenAsync(
        this.scene,
        {
          targets: sv,
          y: `-=${moveAmountY}`,
          alpha: 0,
          duration: 300,
          ease: "Sine.easeInOut",
        }).then(() => {
          sv.setVisible(false);
        }
      );
      tasks.push(t);
    }
    
    await Promise.all(tasks);
  }
  
  private createMessageViews(scene: Phaser.Scene) {
    const messageAreaWidth = MOBILE_SCREEN_SIZE.WIDTH;
    const messageViewMaxWidth = messageAreaWidth * 0.7;
    const wrapMargin = 4;
    const canvas = scene.game.canvas;
    const canvasWidth = canvas.width;
    const leftPosX = canvasWidth / 2 - messageAreaWidth / 2 + 40;
    const rightPosX = canvasWidth / 2 + messageAreaWidth / 2 - 40;
    
    // ピンク色
    const leftMessageViewColor　= GetColorCodeByRGB (255, 192, 203);
    // 薄い灰色
    const rightMessageViewColor = GetColorCodeByRGB (220, 220, 230);
    
    // 左側
    for (let i = 0; i < 3; i++) {
      const messageView = new MessageView(
        scene,
        TEXT_SIZE,
        messageViewMaxWidth,
        wrapMargin,
        false,
        leftMessageViewColor,
      );
      messageView.setPosition(leftPosX, 300 + i * 150);
      messageView.setVisible(false);

      this.leftMessageViews.push(messageView);
    }
    
    // 右側
    for (let i = 0; i < 3; i++) {
      const messageView = new MessageView(
        scene,
        TEXT_SIZE,
        messageViewMaxWidth,
        wrapMargin,
        true,
        rightMessageViewColor,
      );
      messageView.setPosition(rightPosX, 600 + i * 150);
      messageView.setVisible(false);

      this.rightMessageViews.push(messageView);
    }
  }
}