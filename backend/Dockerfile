# syntax=docker/dockerfile:1.6
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY go.sum* ./
RUN go mod download || true
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /bin/server ./cmd/server

FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=build /bin/server /app/server
COPY migrations /app/migrations
ENV MIGRATIONS_PATH=/app/migrations
EXPOSE 8080
ENTRYPOINT ["/app/server"]
