/**
 * The base ContextMenu class. Provides methods to build an
 * and show context menus.
 */
// const yadl = require('@tbrink/yadl')

class ContextMenu {
  constructor(menuTemplate) {
    this._menu = []

    menuTemplate.forEach(menuItem => {
      if (menuItem.submenu && menuItem.submenu.length) {
        let newMenuItem = menuItem
        newMenuItem.submenu = new ContextMenu(menuItem.submenu)
        this._menu.push(newMenuItem)
      } else {
        this._menu.push(menuItem)
      }
    })

    this.options = {
      menuElementTag: 'div',
      menuElementClass: 'context-menu',
      menuItemTag: 'div',
      separatorClass: 'separator',
      submenuClass: 'submenu',
      menuWidth: 200,
      acceleratorClass: 'menu-item-accelerator'
    }

    let elt = yadl.select(this.options.menuElementTag + '.' + this.options.menuElementClass)

    if (!elt.length && elt.length !== 0) {
      this._elt = elt
    } else {
      elt = yadl.create(this.options.menuElementTag)
        .attach()
        .style('width', this.options.menuWidth + 'px')
      elt.classList.add(this.options.menuElementClass, 'hidden')
      this._elt = elt
    }
    
  }

  show(x, y) {
    this._elt.children.forEach(c => c._element.remove())

    this._elt
      .style('left', x + 'px')
      .style('top', y + 'px')
      .classList.remove('hidden')

    this._menu.forEach(menuItem => {
      let mi = yadl.create(this.options.menuItemTag)

      if (menuItem.type == 'separator')
        mi.classList.add(this.options.separatorClass)
      else
        mi.set('textContent', menuItem.label)

      if (mi.submenu)
        mi.listen('mouseover', e => { mi.submenu.show(0, 0) })
          .listen('mouseout', mi.submenu.hide)
          .classList.add(this.options.submenuClass)
        
      if (menuItem.accelerator) {
        ui.addAccelerator(menuItem.accelerator, menuItem.click)
        mi.append(yadl.create('span')
          .text(menuItem.accelerator)
          .setClass(this.options.acceleratorClass))
      }

      mi.attach(this._elt)

      mi.listen('click', menuItem.click)
    })
  }

  hide() {
    this._elt.classList.add('hidden')
  }
}