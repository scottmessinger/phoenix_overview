defmodule Docs.DocumentChannel do
  use Docs.Web, :channel
  alias Docs.Document

  def join("documents:" <> doc_id, params, socket) do
    send(self, {:after_join, params})
    {:ok, assign(socket, :doc_id, doc_id)}
  end

  def handle_info({:after_join, params}, socket) do
    doc = Repo.get(Document, socket.assigns.doc_id)
    messages = Repo.all(
      from m in assoc(doc, :messages),
        order_by: [desc: m.inserted_at],
        select: %{id: m.id, body: m.body},
        limit: 100
    )
    push socket, "messages", %{messages: messages}
    {:noreply, socket}
  end


  def handle_in("new_message", params, socket) do
    changeset =
      Docs.Document
      |> Docs.Repo.get(socket.assigns.doc_id)
      |> Ecto.Model.build(:messages)
      |> Docs.Message.changeset(params)

    case Docs.Repo.insert(changeset) do
      {:ok, msg} ->
        broadcast! socket, "new_message", %{body: msg.body}
        {:reply, :ok, socket}

      {:error, changeset} ->
        {:reply, {:error, %{reasons: changeset}}, socket}
    end
  end

  def handle_in("save", params, socket) do
    Document
    |> Repo.get(socket.assigns.doc_id)
    |> Document.changeset(params)
    |> Repo.update()
    |> case do
      {:ok, _document} ->
        {:reply, :ok, socket}
      {:error, changeset} ->
        {:reply, {:error, %{reasons: changeset}}, socket}
    end
  end

  def handle_in("text_change", %{"ops" => ops}, socket) do
    broadcast_from! socket, "text_change", %{
      ops: ops
    }
    {:reply, :ok, socket}
  end

  def handle_in("selection_change", params, socket) do
    broadcast_from! socket, "selection_change", %{
      user_id: params["user_id"],
      username: params["username"],
      color: params["color"],
      end: params["end"]
    }
    {:reply, :ok, socket}
  end





  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (documents:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  # This is invoked every time a notification is being broadcast
  # to the client. The default implementation is just to push it
  # downstream but one could filter or change the event.
  def handle_out(event, payload, socket) do
    push socket, event, payload
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
