/**
 * キュー
 */
export class Queue<T> {
  private items: T[] = [];

  // キューに要素を追加 (enqueue)
  enqueue(item: T) {
    this.items.push(item);
  }

  // キューから要素を取り出す (dequeue)
  dequeue(): T | undefined {
    return this.items.shift();
  }

  // キューが空かどうかをチェック
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // キューの先頭要素を確認
  peek(): T | undefined {
    return this.items[0];
  }

  // キューのサイズを取得
  size(): number {
    return this.items.length;
  }
}