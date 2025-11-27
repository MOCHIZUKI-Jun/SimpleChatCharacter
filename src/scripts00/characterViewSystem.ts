import {SimpleMessageBroker} from "../utility/simpleMessageBroker.ts";
import {CancelContext, CharacterView} from "./characterView.ts";
import {SystemMessageArgOnReplyReceived} from "./messageViewSystem.ts";
import {SimpleDisposableInterface} from "../utility/simpleDisposableInterface.ts";
import {waitMilliSeconds} from "../utility/asyncUtility.ts";

/**
 * キャラ表示システム
 */
export class CharacterViewSystem {

  private readonly messageBroker: SimpleMessageBroker;
  private readonly characterView: CharacterView;
  private cancelContext?:CancelContext;
  
  private readonly disposables: SimpleDisposableInterface[] = [];
  
  constructor(
    messageBroker: SimpleMessageBroker,
    characterView: CharacterView,
  ) {
    this.messageBroker = messageBroker;
    this.characterView = characterView;

    // レスポンス受信時イベント
    this.disposables.push(
      this.messageBroker.subscribe(SystemMessageArgOnReplyReceived.KEY, (a) => {
        const arg = a as SystemMessageArgOnReplyReceived;
        const response = arg.response;
        this.onReceiveResponseAsync(response).then();
      })
    );
    
    // アイドルアニメーション再生
    const neverCancelContext = new CancelContext();
    this.characterView.playEyeBlinkLoopAsync(neverCancelContext).then();
    this.cancelContext = new CancelContext();
    this.playIdleAnimationAsync(this.cancelContext, 200).then();
    
    // デバッグ
    //this.characterView.playDebugAnimAsync(cancelContext).then();
  }
  
  public dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
  
  /**
   * 指定秒数待機してからアイドルアニメーション再生
   */
  private async playIdleAnimationAsync(cancelContext:CancelContext, delayMs: number) {
    await waitMilliSeconds(delayMs);
    if (cancelContext.isCancelled) {
      return;
    }
    this.characterView.playSideShakeLoopAsync(cancelContext).then();
    this.characterView.playTailShakeLoopAsync(cancelContext).then();
  }
  
  private async onReceiveResponseAsync(response: string) {
    console.log(`Received response: ${JSON.stringify(response)}`);

    // 文字列1文字につき100ms待機
    const talkMs = response.length * 100;
    
    //　話すアニメーション再生
    this.cancelContext?.cancel();
    await this.characterView.playTalingAsync(talkMs);
    
    // アイドルアニメーション再生再開
    this.cancelContext = new CancelContext();
    this.playIdleAnimationAsync(this.cancelContext, 7800).then();
  }
}