# Builds the React client and the ASP.NET Core server into one image that
# serves both: the client's build output becomes the server's wwwroot.

FROM node:22-alpine AS client
WORKDIR /src
COPY alecsite.client/package.json alecsite.client/package-lock.json ./
RUN npm ci
COPY alecsite.client/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server
WORKDIR /src
COPY AlecSite.Server/AlecSite.Server.csproj AlecSite.Server/
RUN dotnet restore AlecSite.Server/AlecSite.Server.csproj -p:ExcludeClientProject=true
COPY AlecSite.Server/ AlecSite.Server/
COPY --from=client /src/dist/ AlecSite.Server/wwwroot/
RUN dotnet publish AlecSite.Server/AlecSite.Server.csproj -c Release -o /app \
    --no-restore -p:ExcludeClientProject=true

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=server /app ./
# The SQLite file is rebuilt from ProjectSeed.cs on every start, so it can
# live anywhere writable; it doesn't need a volume.
RUN mkdir /app/data && chown $APP_UID /app/data
USER $APP_UID
ENV ASPNETCORE_URLS=http://+:8080 \
    ConnectionStrings__Default="Data Source=/app/data/alecsite.db"
EXPOSE 8080
ENTRYPOINT ["dotnet", "AlecSite.Server.dll"]
