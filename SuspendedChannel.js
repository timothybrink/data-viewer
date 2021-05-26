module.exports = class SuspendedChannel {
  constructor(receiver) {
    this.queue = [];
    this.active = false;
    this.receiver = receiver;
  }

  send(item) {
    if (item)
      this.queue.unshift(item);

    if (this.active) {
      while (this.queue.length) {
        let i = this.queue.pop();
        if (i) this.receiver(i);
      }
    }
  }

  enable() {
    this.active = true;
    this.flush();
  }

  flush() {
    while (this.queue.length) {
      let i = this.queue.pop();
      if (i) this.receiver(i);
    }
  }
}