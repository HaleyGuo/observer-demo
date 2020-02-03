//继承了Observable，所以它也是Observable
class Subject<T> extends Observable<T> implements SubscriptionLike {

  [rxSubscriberSymbol]() {
    return new SubjectSubscriber(this);
  }

  observers: Observer<T>[] = [];//观察对象是一个数组，可以多播

  closed = false;

  isStopped = false;

  hasError = false;

  thrownError: any = null;

  constructor() {
    super();
  }

  /**@nocollapse
   * @deprecated use new Subject() instead
  */
  static create: Function = <T>(destination: Observer<T>, source: Observable<T>): AnonymousSubject<T> => {
    return new AnonymousSubject<T>(destination, source);
  }

  lift<R>(operator: Operator<T, R>): Observable<R> {
    const subject = new AnonymousSubject(this, this);
    subject.operator = <any>operator;
    return <any>subject;
  }
  //observer的next方法
  //使用了数组，可以多播
  next(value?: T) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    if (!this.isStopped) {
      const { observers } = this;
      const len = observers.length;
      const copy = observers.slice();
      for (let i = 0; i < len; i++) {
        copy[i].next(value);
      }
    }
  }
  //observer的error方法
  error(err: any) {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].error(err);
    }
    this.observers.length = 0;
  }
  //observer的complete方法
  complete() {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    }
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].complete();
    }
    this.observers.length = 0;
  }

  //取消订阅
  unsubscribe() {
    this.isStopped = true;
    this.closed = true;
    this.observers = null;
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _trySubscribe(subscriber: Subscriber<T>): TeardownLogic {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else {
      return super._trySubscribe(subscriber);
    }
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>): Subscription {
    if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else if (this.hasError) {
      subscriber.error(this.thrownError);
      return Subscription.EMPTY;
    } else if (this.isStopped) {
      subscriber.complete();
      return Subscription.EMPTY;
    } else {
      this.observers.push(subscriber);//把订阅对象推入observers数组，实现多个观察
      return new SubjectSubscription(this, subscriber);
    }
  }

  /**
   * Creates a new Observable with this Subject as the source. You can do this
   * to create customize Observer-side logic of the Subject and conceal it from
   * code that uses the Observable.
   * @return {Observable} Observable that the Subject casts to
   */
  asObservable(): Observable<T> {
    const observable = new Observable<T>();
    (<any>observable).source = this;
    return observable;
  }
}