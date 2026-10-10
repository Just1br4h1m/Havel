FROM mcr.microsoft.com/dotnet/runtime:10.0 AS base
USER $APP_UID
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Havel.Infranstructure/Havel.Infranstructure.csproj", "Havel.Infranstructure/"]
COPY ["Havel.Application/Havel.Application.csproj", "Havel.Application/"]
COPY ["Havel.Domain/Havel.Domain.csproj", "Havel.Domain/"]
RUN dotnet restore "Havel.Infranstructure/Havel.Infranstructure.csproj"
COPY . .
WORKDIR "/src/Havel.Infranstructure"
RUN dotnet build "./Havel.Infranstructure.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Havel.Infranstructure.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Havel.Infranstructure.dll"]
