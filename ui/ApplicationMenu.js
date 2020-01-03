/**
 * A singleton class to build the application menu.
 * Here is where the logic of the menu happens.
 * Takes a command manager, to which it will give
 * actions. Call the init function to build the menu.
 * Employs ContextMenu for the actual menu UI.
 */

class ApplicationMenu {
  constructor(template) {
    this.menus = []

    this.options = {
      menuElementTag: 'span'
    }

    this.template = template
  }

  init(parentElement) {
    this.template.forEach(menuItem => {
      let cm = new ContextMenu(menuItem.submenu)
      this.menus.push(cm)

      yadl.create(this.options.menuElementTag)
        .set('textContent', menuItem.label)
        .listen('click', function () {
          this.parentElement.classList.add('active')
          let rect = this.getBoundingClientRect()
          cm.show(rect.x, rect.y + rect.height)
        })
        .listen('mouseover', function () {
          if (this.parentElement.classList.contains('active')) {
            let rect = this.getBoundingClientRect()
            cm.show(rect.x, rect.y + rect.height)
          }
          })
        .attach(parentElement)
    })

    // remove the active class on click
    parentElement._element.ownerDocument.addEventListener('click', function (e) {
      if (!e.target.parentElement || !e.target.parentElement.classList.contains('app-menu')) {
        parentElement.classList.remove('active')
        document.querySelector('.context-menu').classList.add('hidden')
      }
    })
  }
}