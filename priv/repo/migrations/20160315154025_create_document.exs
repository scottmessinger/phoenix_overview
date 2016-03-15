defmodule Docs.Repo.Migrations.CreateDocument do
  use Ecto.Migration

  def change do
    create table(:documents) do
      add :body, :string
      add :title, :string
      add :author, :string

      timestamps
    end

  end
end
