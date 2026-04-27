import typer
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
import logging

from omniseed.domain.config import get_config
from omniseed.infrastructure.schema_inspector import get_inspector
from omniseed.infrastructure.cache_manager import CacheManager
from omniseed.infrastructure.ai_engine import get_ai_engine
from omniseed.infrastructure.database_executor import get_executor
from omniseed.application.usecases import GenerateUseCase, ResetUseCase

# Setup CLI & Rich
app = typer.Typer(
    name="omniseed",
    help="OmniSeed — Universal AI-Driven Database State Manager",
    add_completion=False,
)
console = Console()

# Minimal logging so it doesn't clash with Rich output
logging.basicConfig(level=logging.ERROR)

def build_generate_usecase() -> GenerateUseCase:
    config = get_config()
    inspector = get_inspector(config.db_connection_string, config.db_type)
    cache_manager = CacheManager()
    ai_engine = get_ai_engine(config)
    executor = get_executor(config.db_connection_string, config.db_type)
    return GenerateUseCase(config, inspector, cache_manager, ai_engine, executor)

def build_reset_usecase() -> ResetUseCase:
    config = get_config()
    inspector = get_inspector(config.db_connection_string, config.db_type)
    cache_manager = CacheManager()
    executor = get_executor(config.db_connection_string, config.db_type)
    return ResetUseCase(config, inspector, cache_manager, executor)

@app.command()
def generate():
    """
    Connect to the target database, generate realistic AI seed data, and cache locally.
    """
    console.rule("[bold blue]OmniSeed Generate Flow")
    
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("[cyan]Initializing dependencies...", total=None)
            
            usecase = build_generate_usecase()
            
            progress.update(task, description="[cyan]Extracting schema, hashing, and generating data...")
            result = usecase.execute()
            
        if result["status"] == "cached":
            console.print(Panel(
                f"Status: [yellow]Golden state already cached.[/yellow]\n"
                f"Affected Rows: [bold green]{result['metrics']['affected_rows']}[/bold green]\n"
                f"Execution Time: [bold cyan]{result['metrics']['duration_seconds']}s[/bold cyan]",
                title="[yellow]Cache Hit & Applied", border_style="yellow"))
        else:
            console.print(Panel(
                f"Status: [green]New seed data generated and cached.[/green]\n"
                f"Affected Rows: [bold green]{result['metrics']['affected_rows']}[/bold green]\n"
                f"Execution Time: [bold cyan]{result['metrics']['duration_seconds']}s[/bold cyan]",
                title="[green]Generation & Application Complete", border_style="green"))
            
    except Exception as e:
        console.print(f"[bold red]Error during generation:[/bold red] {str(e)}")
        raise typer.Exit(code=1)

@app.command()
def regenerate():
    """
    Forcefully delete the current cache, generate new seed data from AI, and apply it to the database.
    """
    console.rule("[bold magenta]OmniSeed Regenerate Flow")
    
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("[magenta]Initializing dependencies...", total=None)
            
            usecase = build_generate_usecase()
            
            progress.update(task, description="[magenta]Invalidating cache, regenerating data, and applying...")
            result = usecase.execute(force_regenerate=True)
            
        console.print(Panel(
            f"Status: [magenta]Cache cleared, new seed data generated and applied.[/magenta]\n"
            f"Affected Rows: [bold green]{result['metrics']['affected_rows']}[/bold green]\n"
            f"Execution Time: [bold cyan]{result['metrics']['duration_seconds']}s[/bold cyan]",
            title="[magenta]Regeneration Complete", border_style="magenta"))
            
    except Exception as e:
        console.print(f"[bold red]Error during regeneration:[/bold red] {str(e)}")
        raise typer.Exit(code=1)

@app.command()
def reset():
    """
    Clean the target database safely and apply cached AI seed data to restore a Golden State.
    """
    console.rule("[bold blue]OmniSeed Reset Flow")
    
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("[cyan]Initializing dependencies and reading cache...", total=None)
            
            usecase = build_reset_usecase()
            
            progress.update(task, description="[cyan]Executing safe database reset transaction...")
            result = usecase.execute()
            
        metrics = result["metrics"]
        console.print(Panel(
            f"Affected Rows: [bold green]{metrics['affected_rows']}[/bold green]\n"
            f"Execution Time: [bold cyan]{metrics['duration_seconds']}s[/bold cyan]",
            title="[green]Reset Successful", 
            border_style="green"
        ))
            
    except Exception as e:
        console.print(f"[bold red]Error during reset:[/bold red] {str(e)}")
        raise typer.Exit(code=1)

if __name__ == "__main__":
    app()
