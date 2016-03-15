defmodule Docs.MessageController do
  use Docs.Web, :controller

  alias Docs.Message

  plug :scrub_params, "message" when action in [:create, :update]

  def index(conn, _params) do
    doc = conn.assigns.document

    messages = Repo.all(from m in assoc(doc, :messages))
    render(conn, "index.html", messages: messages)
  end

  def create(conn, %{"message" => message_params}) do
    doc = conn.assigns.document
    changeset =
      doc
      |> Ecto.Model.build(:messages)
      |> Message.changeset(message_params)


    case Repo.insert(changeset) do
      {:ok, _message} ->
        conn
        |> put_flash(:info, "Message created successfully.")
        |> redirect(to: document_message_path(conn, :index, conn.assigns.document))
      {:error, changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end


end
