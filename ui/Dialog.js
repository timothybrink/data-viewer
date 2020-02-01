class Dialog {
  constructor(contentFactory) {
    this.contentFactory = contentFactory
  }

  show() {
    this._elt = yadl.create('.dialog').attach()
    this.contentFactory(this._elt)
  }

  hide() {
    this._elt.remove()
    this._elt = null
  }
}