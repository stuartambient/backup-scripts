class Topic {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notify(data) {
    this.observers.forEach(o => o.update(data));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }

  update(data) {
    console.log(`${this.name} received ${data}`);
  }
}

const topic = new Topic();

const observer1 = new Observer("Observer 1");
const observer2 = new Observer("Observer 2");

topic.subscribe(observer1);
topic.subscribe(observer2);

topic.notify("Hello World");
// Observer 1 received Hello World
// Observer 2 received Hello World

topic.unsubscribe(observer2);

topic.notify("Hello Again");
topic.notify("Goodbye World");
// Observer 1 received Hello Again
