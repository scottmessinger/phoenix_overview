defmodule Docs.Document do
  use Docs.Web, :model

  schema "documents" do
    field :body, :string
    field :title, :string
    field :author, :string

    timestamps
  end

  @required_fields ~w(body title author)
  @optional_fields ~w()

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
  end
end
