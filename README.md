# LogMeUp

Log Me Up is your Log / Note taking app that helps you get back on track and helps on not forgetting important events from your life.

## How it works?

You can use LogMeUp as a note taking app. Notes are automatically categorized by date. Each date is immutable, what happen in the past can not change.
LogMeUp will detect action items from your logs and move it to your TODO list, powered by TaskMeUp.
On Each new date, LogMeUp will prompt you to reflect on your previous notes and remind about what's important.

## System Design

LogMeUp is being developed in public and this section might get completely altered as we go.
For its PoC, the app is developed using React Router v7 as fullstack framework, using Postgres as for DB storage and OpenAI as model provider.

## Development

If you want to try out or contribute to LogMeUP, simply clone this repo, install its dependencies using `npm i` and start it with `npm run dev`.

## Running local [In Progress]

You can run the whole app locally using minikube.

To accomplish that you need to run a few things in advance:

1. Docker image registry

```bash
$ podman container run -dt -p 5001:5000 --name registry docker.io/library/registry:3
```

2. Postgres database
3. ollama server

Then you need to build the images

```bash
$ podman build -t localhost:5001/logmeup-frontend
```

```bash
$ podman image push localhost:5001/logmeup-frontend --tls-verify=false
```