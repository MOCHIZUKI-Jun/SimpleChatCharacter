import {SimpleMessageBroker} from "../utility/simpleMessageBroker.ts";
import {CharacterView} from "./characterView.ts";
import {SystemMessageArgOnReplyReceived} from "./messageViewSystem.ts";
import {SimpleDisposableInterface} from "../utility/simpleDisposableInterface.ts";

/**
 * キャラ表示システム
 */
export class CharacterViewSystem {

  private readonly messageBroker: SimpleMessageBroker;
  private readonly characterView: CharacterView;
  
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
  }
  
  public dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
  
  private async onReceiveResponseAsync(response: string) {
    console.log(`Received response: ${JSON.stringify(response)}`);
  }
}