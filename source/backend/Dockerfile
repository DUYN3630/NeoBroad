# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first to leverage Docker cache
COPY ["NeoBoard.sln", "./"]
COPY ["NeoBoard.Web/NeoBoard.Web.csproj", "NeoBoard.Web/"]
COPY ["NeoBoard.Application/NeoBoard.Application.csproj", "NeoBoard.Application/"]
COPY ["NeoBoard.Domain/NeoBoard.Domain.csproj", "NeoBoard.Domain/"]
COPY ["NeoBoard.Infrastructure/NeoBoard.Infrastructure.csproj", "NeoBoard.Infrastructure/"]

# Copy external local DLLs required for building
COPY ["libs/", "./libs/"]

# Restore dependencies
RUN dotnet restore "NeoBoard.sln"

# Copy the remaining source code files
COPY . .

# Build and publish in Release mode
RUN dotnet publish "NeoBoard.Web/NeoBoard.Web.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose port 8080 (standard for Render and Cloud Run)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "NeoBoard.Web.dll"]
