import {ReadonlyObservableInterface, SimpleDisposableInterface} from "./simpleDisposableInterface.ts";

/**
 * 簡易Observableクラス
 */
export class SimpleObservable implements ReadonlyObservableInterface {
  functionList: any[];
  
  /**
   * コンストラクタ
   */
  constructor() {
    this.functionList = [];
  }

  /**
   * 発行
   */
  public on(_msg: any) {
    this.functionList.forEach((func) => {
      func(_msg);
    });
  }

  /**
   * 購読
   */
  public subscribe(f: any) {
    const disposable = new SimpleDisposable(f, this);
    this.functionList.push(f);
    return disposable;
  }

  /**
   * 購読解除
   */
  public unsubscribe(f: any) {
    this.functionList = this.functionList.filter((func) => func !== f);
  }
}

/**
 *  簡易Disposableクラス
 */
export class SimpleDisposable implements SimpleDisposableInterface {
  private readonly targetFunc: any;
  private readonly observable: SimpleObservable;

  /**
   * コンストラクタ
   */
  constructor(targetFunc: any, observable: SimpleObservable) {
    this.targetFunc = targetFunc;
    this.observable = observable;
  }

  /**
   * 破棄
   */
  public dispose() {
    this.observable.unsubscribe(this.targetFunc);
  }
}
