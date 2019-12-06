function successAlert(msg) {
  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: msg,
    showConfirmButton: false,
    timer: 1500
  })
}

function errorAlert(msg) {
  Swal.fire({
    icon: 'error',
    title: 'Erro!',
    text: msg,
    footer: ''
  })
}

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
        errorAlert('Não foi possível carregar a nota.')
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
      successAlert('A nota foi atualizada com sucesso!')
    })
    .fail(function (error) {
      errorAlert('Não foi possível salvar a nota.')
      console.log(error)
    })
}

function postNote(data) {
  $.post('/notes/', data)
    .done(function () {
      successAlert('A nota foi salva com sucesso!')
    })
    .fail(function (error) {
      errorAlert('Não foi possível salvar a nota.')
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

    Swal.fire({
      title: 'Tem certeza que deseja alterar a nota?',
      text: "Você não poderá reverter essa ação!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, alterar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        putNote(id, {
          content: textContent.value,
          date: date.toISOString(),
          important: isImportant.checked
        })
      }
    })

  } else {
    postNote({
      content: textContent.value,
      date: date.toISOString(),
      important: isImportant.checked
    })
  }
}