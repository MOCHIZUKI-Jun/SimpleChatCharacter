import {EmptyDisaposable, SimpleDisposableInterface} from "./simpleDisposableInterface.ts";

/**
 * 疎結合システム間PubSub引数インターフェース
 */
export interface SimpleMessageArgInterface {
  mappingKey: string;
}

/**
 * 登録関数マップ
 */
type FuncMap<T> = {
  [key: string]: T;
};

/**
 * 疎結合システム間PubSub呼び出し定義
 */
export type Method<TArg extends SimpleMessageArgInterface> = (arg: TArg) => void;

/**
 * 疎結合を保つためのPubSub仲介
 */
export class SimpleMessageBroker {
  private isDisposed = false;

  private funcMap: FuncMap<(Method<SimpleMessageArgInterface> | undefined)[]> = {};

  /**
   * 発行
   */
  public publish<TArg extends SimpleMessageArgInterface>(arg: TArg): void {
    // 仲介が破棄済であれば終了
    if (this.isDisposed) {
      console.warn("SimpleMsgBroker is disposed.");
      return;
    }

    // 未登録であれば終了
    if (!this.funcMap[arg.mappingKey]) {
      console.warn("SimpleMsgBroker is not registered.", arg.mappingKey);
      return;
    }

    // 実行
    for (const f of this.funcMap[arg.mappingKey]) {
      if (!f) {
        continue;
      }
      f(arg);
    }
  }

  /**
   * 購読
   */
  public subscribe(mappingKey: string, func: Method<SimpleMessageArgInterface>) {
    // 仲介が破棄済であればエラーログを出す
    if (this.isDisposed) {
      console.warn("SimpleMsgBroker is disposed.");
      return new EmptyDisaposable();
    }

    // 登録
    if (!this.funcMap[mappingKey]) {
      this.funcMap[mappingKey] = [];
    }
    this.funcMap[mappingKey].push(func);

    const targetIndex = this.funcMap[mappingKey].length - 1;

    // 利用側で好きなタイミングで破棄できるようにDisposableを返す
    return new SimpleMessageDisposable(mappingKey, targetIndex, this);
  }

  /**
   * 購読解除
   */
  public unsubscribe(key: string, funcIndex: number) {
    console.log(`SimpleMsgBroker unsubscribe key:${key} funcIndex:${funcIndex}`);
    const funcs = this.funcMap[key];
    if (funcs) {
      funcs[funcIndex] = undefined;
    } else {
      console.warn("SimpleMsgBroker is not registered.", key);
    }
  }

  /**
   * 仲介破棄
   */
  public dispose() {
    this.isDisposed = true;
  }
}

/**
 *  簡易PubSubのDisposableクラス
 */
export class SimpleMessageDisposable implements SimpleDisposableInterface {
  private readonly targetKey: string;
  private readonly funcIndex: number;
  private readonly msgBroker: SimpleMessageBroker;

  /**
   * コンストラクタ
   */
  constructor(
    targetKey: string,
    funcIndex: number,
    msgBroker: SimpleMessageBroker,
  ) {
    this.targetKey = targetKey;
    this.funcIndex = funcIndex;
    this.msgBroker = msgBroker;
  }

  /**
   * 破棄
   */
  public dispose() {
    this.msgBroker.unsubscribe(this.targetKey, this.funcIndex);
  }
}
