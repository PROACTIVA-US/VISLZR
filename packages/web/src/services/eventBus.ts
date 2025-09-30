type Handler<T> = (payload: T) => void;

export class EventBus {
  private map = new Map<string, Set<Handler<any>>>();

  on<T = any>(event: string, handler: Handler<T>) {
    if (!this.map.has(event)) this.map.set(event, new Set());
    this.map.get(event)!.add(handler as Handler<any>);
    return () => this.off(event, handler);
  }

  off<T = any>(event: string, handler: Handler<T>) {
    const set = this.map.get(event);
    if (!set) return;
    set.delete(handler as Handler<any>);
    if (set.size === 0) this.map.delete(event);
  }

  emit<T = any>(event: string, payload: T) {
    const set = this.map.get(event);
    if (!set) return;
    for (const h of set) h(payload);
  }

  clear() {
    this.map.clear();
  }
}

export const bus = new EventBus();
