// public/js/inventory.js
'use strict';

(function () {
  // ensure DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const classificationList = document.querySelector('#classificationList')
    if (!classificationList) {
      // If the select isn't on the page, nothing to do.
      console.log("No #classificationList element found on this page.")
      return
    }

    classificationList.addEventListener('change', () => {
      const classification_id = classificationList.value
      console.log(`classification_id is: ${classification_id}`)
      const classIdURL = `/inv/getInventory/${classification_id}`

      fetch(classIdURL)
        .then(response => {
          if (response.ok) {
            return response.json()
          }
          throw new Error('Network response was not OK')
        })
        .then(data => {
          console.log('Inventory JSON received:', data)
          buildInventoryList(data)
        })
        .catch(error => {
          console.error('There was a problem fetching inventory:', error.message)
        })
    })
  })

  // Build inventory items into HTML table components and inject into DOM
  window.buildInventoryList = function buildInventoryList(data) {
    const inventoryDisplay = document.getElementById('inventoryDisplay')
    if (!inventoryDisplay) return

    // Set up the table labels
    let dataTable = '<thead>'
    dataTable += '<tr><th>Vehicle Name</th><th></th><th></th></tr>'
    dataTable += '</thead>'

    // Set up the table body
    dataTable += '<tbody>'

    if (!Array.isArray(data) || data.length === 0) {
      dataTable += '<tr><td colspan="3">No inventory items found for this classification.</td></tr>'
    } else {
      data.forEach(element => {
        // safe property access, fallback text
        const id = element.inv_id || ''
        const make = element.inv_make || ''
        const model = element.inv_model || ''
        dataTable += `<tr>
          <td>${escapeHtml(make)} ${escapeHtml(model)}</td>
          <td><a href="/inv/edit/${id}" title="Click to update">Modify</a></td>
          <td><a href="/inv/delete/${id}" title="Click to delete">Delete</a></td>
        </tr>`
      })
    }

    dataTable += '</tbody>'
    inventoryDisplay.innerHTML = dataTable
  }

  // small helper to avoid naive injection of unsanitized data into HTML
  function escapeHtml(str) {
    if (!str) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
})()
