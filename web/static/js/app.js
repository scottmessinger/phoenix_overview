// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

import {Socket} from "phoenix"
let socket = new Socket("/socket", {
  logger: (kind, msg, data) => {
    console.log(`${kind}: ${msg}`, data)
  },
  params: {token: window.userToken}
})

socket.connect()
socket.onOpen( () => console.log("connected!") )

let App = {
  init(){
    let docId = $("#doc-form").data("id")
    if(!docId){ return }

    let docChan = socket.channel("documents:" + docId)

    let authorInput = $("#document_author")
    authorInput.val("user-" + Math.floor(Math.random() * 1000))
    let msgContainer = $("#messages")
    let msgInput = $("#message-input")

    msgInput.on("keypress", e => { if(e.which !== 13){ return }
      docChan.push("new_message", {body: msgInput.val()})
      msgInput.val("")
    })
  }
}

App.init()
