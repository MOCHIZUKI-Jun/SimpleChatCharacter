import {ApiClientInterface} from "./messageViewSystem.ts";

/**
 * かわいいモックLLM
 */
export class CuteMockLLM implements ApiClientInterface {
  
  /**
   * @inheritDoc
   */
  public async request(message: string): Promise<string> {
    console.log('CuteMockLLM request:', message);
    
    // 簡単なモック応答を生成
    const responses = [
      "それはとても興味深いガウ！",
      "もっと詳しく教えてくれガウ！",
      "なるほどガウ",
      "それは笑えるガウ〜〜！",
      "それについてどう思うガウ？"
    ];
    
    // ランダムに応答を選択
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // 応答を返す
    return new Promise((resolve) => {
      setTimeout(() => resolve(response), 1000); // 1秒の遅延をシミュレート
    });
  }
}