document.addEventListener("input", function (event) {
  const field = event.target
  if (!field.matches("input, textarea, select")) return

  if (field.validity.valid) {
    field.classList.add("valid")
    field.classList.remove("invalid")
  } else {
    field.classList.add("invalid")
    field.classList.remove("valid")
  }
})
