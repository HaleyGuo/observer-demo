class publisher{
  constructor() {
    this.subscribers = {};
  }

  subscribe(topic, callback) {
    let callbacks = this.subscribers[topic];
    if (!callbacks) {
      this.subscribers[topic] = [callback];
    } else {
      callbacks.push(callback);
    }
  }

  publish(topic, ...args) {
    let callbacks = this.subscribers[topic];
    callbacks.forEach((callback) => {
      callback(...args);
    })
  }
}

const handler = (...args) => {
  console.log(...args);
}

let pub = new publisher();
pub.subscribe('notify', handler);
pub.subscribe('notify', handler);
pub.subscribe('message', handler);
pub.publish('notify', 'you are informed');
pub.publish('message', 'you have a message');
// you are informed
// you are informed
// you have a message
