const dialog = document.querySelector('dialog')
const contentElt = dialog.querySelector('.content')

module.exports = function (content, html = false) {
  dialog.show()
  if (html) {
    contentElt.innerHTML = content
  } else {
    contentElt.textContent = content
  }
  return dialog
}