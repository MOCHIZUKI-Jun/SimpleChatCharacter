import {ApiClientInterface} from "./messageViewSystem.ts";

/**
 * かわいいモックLLM
 */
export class CuteMockLLM implements ApiClientInterface {
  
  /**
   * @inheritDoc
   */
  public async request(_message: string): Promise<string> {
    // 簡単なモック応答を生成
    const responses = [
      "それはとても興味深いガウ！",
      "もっと詳しく教えてくれガウ！",
      "なるほどガウ",
      "それは笑えるガウ〜〜！",
      "それについてどう思うガウ？",
      "わたしもそう思うガウ！",
      "本当にそうガウか？",
      "それは秘密ガウ☆",
      "一緒に遊ぼうガウ！",
      "それは素晴らしいガウ！",
      "笑えないガウ〜",
      "もっと話してガウ！",
    ];
    
    // ランダムに応答を選択
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // 応答を返す
    return new Promise((resolve) => {
      const randomDerayMs = Math.floor(Math.random() * 1000) + 1000; // 1000ms〜2000msのランダム遅延
      setTimeout(() => resolve(response), randomDerayMs);
    });
  }
}