FROM mcr.microsoft.com/dotnet/runtime:10.0 AS base
USER $APP_UID
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Havel.Application/Havel.Application.csproj", "Havel.Application/"]
COPY ["Havel.Domain/Havel.Domain.csproj", "Havel.Domain/"]
RUN dotnet restore "Havel.Application/Havel.Application.csproj"
COPY . .
WORKDIR "/src/Havel.Application"
RUN dotnet build "./Havel.Application.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Havel.Application.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Havel.Application.dll"]
