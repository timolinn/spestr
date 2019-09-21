# Internet speed tester

## Introduction

This is web application written in Go. Created to aggregate internet speed of multiple service providers into regions/location made freely available on the internet.

![Why I created this](image.png)

Works like fast.com, actually it's literally fast.com but persist internet speed based on user location, which is made available to the public.

## Usage

<!-- Demo: [spestr.herokuapp.com](https://spestr.herokuapp.com) -->

## Run locally

### Create configuration file:

```bash
cp sample.spestr.yml spestr.yml
```

Remember to update the configuration to match your local setup

### Build the binary

```bash
go build ./cmd/spestr
```

### Start the server

```bash
./spestr
```

## Coming soon

- User interface powered by Reactjs
- Docker support
