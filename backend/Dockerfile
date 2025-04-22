FROM golang:bookworm AS base

WORKDIR /build

ENV BACKEND__FILES_TO_WATCH=""

COPY go.mod go.sum ./

RUN go mod download

COPY . .
RUN go build -o backend

EXPOSE 8080

CMD ["/build/backend"]
