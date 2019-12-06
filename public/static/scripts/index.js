/**
 * Handles the list sorter.
 * Returns a sort order or its object.
 *
const sortBy = (function () {
  let selectedSort = ''
  const sort = {
    important: '&_sort=important,date&_order=desc,desc',
    date: '&_sort=date,important&_order=desc,desc',
    content: '&_sort=content'
  }

  return {
    important: function () {
      if (selectedSort != sort.important) {
        selectedSort = sort.important
        return selectedSort
      }
    },
    date: function () {
      if (selectedSort != sort.date) {
        selectedSort = sort.date
        return selectedSort
      }
    },
    content: function () {
      if (selectedSort != sort.content) {
        selectedSort = sort.content
        return selectedSort
      }
    },
    current: function () {
      return selectedSort
    },
    verify: function () {
      return sort
    }
  }
})()

/**
 * Sorts list elements by importance.
 *
function sortByImportant() {
  if (sortBy.verify().important != sortBy.current()) {
    getNotes(sortBy.important())
  }
}

/**
 * Sorts list elements by date.
 *
function sortByDate() {
  if (sortBy.verify().date != sortBy.current()) {
    getNotes(sortBy.date())
  }
}

/**
 * Sorts list elements by content.
 *
function sortByContent() {
  if (sortBy.verify().content != sortBy.current()) {
    getNotes(sortBy.content())
  }
}*/

/**
 * Handles a Note id private array.
 * Returns the element id real value.
 *
const noteId = (function () {
  let privateNoteIds = []

  return {
    add: function (id) {
      privateNoteIds.push(id)
    },
    get: function (i) {
      const val = privateNoteIds.splice(i, 1)
      return val[0]
    }
  }
})()*/

/**
 * Transforms ISO 8601 format date String to a ISO-like locale format.
 * Returns a modified ISO 8601 String.
 */
function getFormattedDate(noteDate) {
  const date = new Date(noteDate)
  const formattedDate = date.getDate().toString() // {1-31}
    .concat('/')
    .concat((date.getMonth() + 1).toString()) // {0-11} + 1
    .concat('/')
    .concat(date.getFullYear().toString())
    .concat(', ')
    .concat(date.getHours().toString()) // {0-23}
    .concat(':')
    .concat(date.getMinutes().toString()) // {0-59}
  return formattedDate
}

/**
 * Deletes the selected element and calls the getNotes function.
 */
function removeNote(id) {
  // id = noteId.get(pos)
  $.ajax({
      url: '/notes/' + id,
      method: 'DELETE'
    })
    .done(function () {
      getNotes()
      alert("SUCCESS: The note has been deleted!")
    })
    .fail(function (error) {
      alert("ERROR: This note could not be deleted.")
      console.log(error)
    })
}

/**
 * Sends the selected element id to the register page
 *
function sendNote(id) {
  $.get('/register.html', id)
}*/

/**
 * Populates a note list in the "list" id element through a mapped array.
 * Returns a HTML fragment containing Note parameters within it.
 */
function fillNotes(notes) {
  // let listPos = -1

  const noteList = notes.map((note) => {
      // listPos++
      // noteId.add(note.id)

      return `
        <tr ${note.important == 'true' ? 'class="important"' : ''}>
          <td>${getFormattedDate(note.date)}</td>
          <td>${note.content}</td>
          <td><a id="edit-${note.id}" href="register.html?${note.id}">Editar</a></td>
          <td><button id="del-${note.id}" class="del" onclick="removeNote(${note.id})">Excluir</button></td>
        </tr>`
    })
    .join('')

  // Assigns HTML element by its id.
  const list = document.querySelector('#list')
  // Replaces the resulting nodes into the DOM tree.
  list.innerHTML = noteList
}

/**
 * Paginates the list notes.
 */
function paginate(page, links) {
  function setPagination(first, prev, next, last, pageIndex) {
    const pageLinks = `
      <tr>
        <td colspan=2>
          <a id="first-page" href="${first}" >|<<</a>
          <a id="prev-page" href="${prev}" rel="prev"><</a>
          <span>${pageIndex}</span>
          <a id="next-page" href="${next}" rel="next">></a>
          <a id="last-page" href="${last}" >>>|</a>
        </td>
      </tr>`

    const tfoot = document.querySelector('#page-index')
    tfoot.innerHTML = pageLinks
  }

  if (links != null) {
    const currentPage = page.substring(7, 8)
    const lastPage = links[links.length - 1].substring(7, 8)

    if (links.length == 3) {
      if (currentPage == 1) {
        // First page
        setPagination(
          '#',
          '#',
          links[1],
          links[2],
          currentPage + '/' + lastPage)

      } else {
        // Last page
        setPagination(
          links[0],
          links[1],
          '#',
          '#',
          currentPage + '/' + lastPage)

      }
    } else {
      setPagination(
        links[0],
        links[1],
        links[2],
        links[3],
        currentPage + '/' + lastPage)

    }
  }
}

/**
 * Makes a request to get the note list.
 * Returns a JSON object through its callback.
 */
function getNotes() {
  // Host url
  const url = window.location.href

  // Page receives the false's value in the first request and "true" in the others.
  const page = url.includes('?_page=') ? new String(url.match(/\?_page=.&_limit=./)) : '?_page=1&_limit=3'

  // http://localhost:3000/notes/?_page=.&limit=.&_sort=date,important&_order=desc,desc'
  $.get('/notes/' + page + '&_sort=date,important&_order=desc,desc')
    .done(function (data, status, xhr) {
      // If successful, return the data callback
      fillNotes(data)
      paginate(page, xhr.getResponseHeader('link')
        .match(/\?_page=.&_limit=./g))
    })
    .fail(function (error) {
      // If it fails, load an error message
      const list = document.querySelector('#list')
      list.innerHTML = `<tr><td colspan=5>Erro ao carregar a lista!</td></tr>`
      console.log(error)
    });
}

// Calls the function when the page is loaded.
window.onload = getNotes()