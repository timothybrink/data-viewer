class Dialog {
  constructor(contentFactory) {
    this.contentFactory = contentFactory
  }

  show() {
    this._elt = yadl.create('div').attach()
    this.contentFactory(this._elt)
    this._elt.classList.add('dialog')
  }

  hide() {
    this._elt.remove()
    this._elt = null
  }
}