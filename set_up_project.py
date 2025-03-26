import typer
from pathlib import Path
import yaml
from rich import print
from rich.tree import Tree
import logging
import os

app = typer.Typer()

# Setup logging
logging.basicConfig(
    filename="adaptmax.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

def create_structure(base_path: Path, structure: dict):
    for folder in structure.get("folders", []):
        folder_path = base_path / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        (folder_path / ".keep").touch()
        logging.info(f"Created folder: {folder_path}")

    for file_path, content in structure.get("files", {}).items():
        full_path = base_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content, encoding="utf-8")
        logging.info(f"Created file: {full_path}")

def show_tree(directory: Path):
    def build_tree(path: Path, tree: Tree):
        for item in sorted(path.iterdir()):
            branch = tree.add(f"[bold blue]{item.name}" if item.is_dir() else f"[green]{item.name}")
            if item.is_dir():
                build_tree(item, branch)

    tree = Tree(f":open_file_folder: [bold]{directory.name}")
    build_tree(directory, tree)
    print(tree)

@app.command()
def init(
    name: str = typer.Argument(..., help="Name of the project folder"),
    template: str = typer.Option("basic", help="Template to use")
):
    """Initialize a new AdAptMax project from template"""
    base_path = Path(name)
    if base_path.exists():
        print(f"[red]❌ Directory '{name}' already exists.")
        raise typer.Exit()

    try:
        with open(Path(__file__).parent / "templates" / f"{template}.yaml", "r", encoding="utf-8") as f:
            structure = yaml.safe_load(f)
    except FileNotFoundError:
        print(f"[red]❌ Template '{template}.yaml' not found in /templates.")
        raise typer.Exit(code=1)
    except yaml.YAMLError as e:
        print(f"[red]❌ YAML parse error: {e}")
        raise typer.Exit(code=1)

    create_structure(base_path, structure)
    show_tree(base_path)
    print(f"[bold green]\n✅ Project '{name}' created successfully.")

    # Optional: Git init
    if not (base_path / ".git").exists():
        os.system(f"git init {base_path}")
        print("[blue]🔧 Git initialized.")

    # Optional: Create .env from example
    env_example = base_path / ".env.example"
    if env_example.exists():
        (base_path / ".env").write_text(env_example.read_text())
        print("[blue]🔧 .env file created from .env.example")

if __name__ == "__main__":
    app()