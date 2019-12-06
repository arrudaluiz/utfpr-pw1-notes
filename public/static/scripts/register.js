function getFormattedDate(date) {
  date.setHours(date.getHours() - (date.getTimezoneOffset() / 60))
  date.setMinutes(date.getMinutes())
  return date.toISOString().substr(0, 16)
}

function loadDate() {
  let now = getFormattedDate(new Date())
  let date = document.querySelector('#date-in')
  date.setAttribute('min', now)
  date.setAttribute('value', now)
}

function fillForm(note) {
  document.querySelector('#date-in').value = getFormattedDate(new Date(note.date))
  document.querySelector('#content-in').value = note.content
  document.querySelector('#important-in').checked = note.important == 'true' ? true : false
}

/**
 * Makes a request to get the note list.
 * Returns a JSON object through its callback.
 */
function getNote() {
  if (window.location.href.includes('?')) {
    const id = window.location.href.split('?').pop()

    $.get('/notes/' + id)
      .done(function (data) {
        // If successful, return the data callback
        fillForm(data)
      })
      .fail(function (error) {
        // If it fails, load an error message
        const list = document.querySelector('#list')
        console.log(error)
      });
  }
}

window.onload = function () {
  loadDate()
  getNote()
  
  document.querySelector("#note-submit").addEventListener('click', handleSubmit)
}

function putNote(id, data) {
  $.ajax({
    url: '/notes/' + id,
    method: 'PUT',
    data: data
  })
  .done(function () {
    alert("SUCCESS: The note has been updated!")
  })
  .fail(function (error) {
    alert("ERROR: This note could not be updated.")
    console.log(error)
  })
}

function postNote(data) {
  $.post('/notes/', data)
    .done(function () {
      alert("SUCESSO!")
    })
    .fail(function (error) {
      alert("ERRRO!")
      console.log(error)
    })
}

function handleSubmit(event) {
  event.preventDefault()

  const selectedDate = document.querySelector('#date-in')
  const textContent = document.querySelector('#content-in')
  const isImportant = document.querySelector('#important-in')

  let date = new Date(selectedDate.value)

  if (date.toISOString() < new Date().toISOString()) {
    selectedDate.value = getFormattedDate(new Date())
    alert('Por favor, insira uma data/hora futura.')

  } else if (textContent.value.trim() === '') {
    textContent.value = ''
    alert('Por favor, insira um conteúdo.')

  } else if (window.location.href.includes('?')) {
    const id = window.location.href.split('?').pop()
    putNote(id, {
      content: textContent.value,
      date: date.toISOString(),
      important: isImportant.checked
    })

  } else {
    postNote({
      content: textContent.value,
      date: date.toISOString(),
      important: isImportant.checked
    })
  }
}