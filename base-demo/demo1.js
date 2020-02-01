class subject {
  constructor() {
    this.observers = [];  
  }
  add(observer) {
    this.observers.push(observer);
  }
  notify(...args) {
    this.observers.forEach(observer => {
        observer.update(...args);
    });
  }
}
class Observer{
  update(...args) {
    console.log(...args); 
  }
}

let ob1 = new Observer();
let ob2 = new Observer();
let sub = new subject();
sub.add(ob1);
sub.add(ob2);
sub.notify('hello, this is news of today');
//hello, this is news of today
//hello, this is news of today

