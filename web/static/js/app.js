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

    docChan.join()
      .receive("ok", () => { })
      .receive("error", reason => console.log("error!", reason) )

    docChan.on("messages", ({messages}) => {
      messages.reverse().forEach( msg => {
        this.appendMessage(msg, msgContainer, docChan)
      })
    })

    docChan.on("new_message", msg => {
      this.appendMessage(msg, msgContainer, docChan)
    })


    let authorInput = $("#document_author")
    authorInput.val("user-" + Math.floor(Math.random() * 1000))
    let msgContainer = $("#messages")
    let msgInput = $("#message-input")

    msgInput.on("keypress", e => { if(e.which !== 13){ return }
      docChan.push("new_message", {body: msgInput.val()})
      msgInput.val("")
    })

    /**
     * Quill
     */
    let editor = new Quill("#editor")
    let saveTimer = null
    editor.on("text-change", (ops, source) => {
      if(source !== "user"){ return }
      clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        this.save(docChan, editor)
      }, 2500)
      docChan.push("text_change", {ops: ops})
    })

    docChan.on("text_change", ({ops}) => {
      editor.updateContents(ops)
    })

    let multiCursor = editor.addModule("multi-cursor", {
      timeout: 1000000000
    })

    editor.on("selection-change", range => {
      if(!range){ return }

      multiCursor.setCursor(
        authorInput.val(),
        range.end,
        authorInput.val(),
        'rgb(255, 0, 255)'
      )
      docChan.push("selection_change", {
        user_id: authorInput.val(),
        end: range.end,
        username: authorInput.val(),
        color: 'rgb(255, 0, 255)'
      })
    })

    docChan.on("selection_change", ({user_id, end, username, color}) => {
      multiCursor.setCursor(
        user_id,
        end,
        username,
        color
      )
    })


  },

  save(docChan, editor){
    let body = editor.getHTML()
    let title = $("#document_title").val()
    docChan.push("save", {body: body, title: title})
    .receive("ok", () => console.log("saved!") )
  },


  appendMessage(msg, msgContainer, docChan){
    msgContainer.append(`<br/>${msg.body}`)
    msgContainer.scrollTop(msgContainer.prop("scrollHeight"))
  }

}

App.init()
