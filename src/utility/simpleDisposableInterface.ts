/**
 * Disposableインターフェース
 */
export interface SimpleDisposableInterface {
  dispose(): void;
}

/**
 * 読み取り専用インターフェース
 */
export interface ReadonlyObservableInterface {
  subscribe(f: any): any;
}

/**
 * エラー時用戻り値で使われる空のDisposable
 */
export class EmptyDisaposable implements SimpleDisposableInterface {
  dispose() {}
}