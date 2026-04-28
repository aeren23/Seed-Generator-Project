# Build Stage for .NET Application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["Bookstore.API/Bookstore.API.csproj", "Bookstore.API/"]
COPY ["Bookstore.Application/Bookstore.Application.csproj", "Bookstore.Application/"]
COPY ["Bookstore.Domain/Bookstore.Domain.csproj", "Bookstore.Domain/"]
COPY ["Bookstore.Infrastructure/Bookstore.Infrastructure.csproj", "Bookstore.Infrastructure/"]

# Add missing project reference relationships if any exist in the solution or restore all
RUN dotnet restore "Bookstore.API/Bookstore.API.csproj"

# Copy the rest of the source code
COPY . .
WORKDIR "/src/Bookstore.API"
RUN dotnet publish "Bookstore.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

# Install Python 3, pip, and venv required by OmniSeed
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Create a Python virtual environment and install OmniSeed dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install OmniSeed dependencies explicitly (sqlalchemy, psycopg2 for postgres connection, etc.)
RUN pip install --no-cache-dir \
    SQLAlchemy \
    psycopg2-binary \
    python-dotenv \
    google-generativeai \
    pydantic \
    pydantic-settings \
    typer \
    rich

EXPOSE 8080

# Copy the compiled .NET application
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Bookstore.API.dll"]
