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

1.  Enable minikube registry addon

```bash
$ minikube addons enable registry
```
2. Build image & push to the registry

```bash
$ podman build . - logmeup-frontend
$ podman image push logmeup-frontend $(minikube ip):5000/logmeup-frontend --tls-verify=false
```

3. Build the cluster from `iac` directory

You'll need to have configuration ready (you can check the [./iac/index.ts](./iac/index.ts) file)

```
$ pulumi up
```

4. Add urls to localhost

Make sure to add `dev.logmeup.local` and `api.logmeup.local` to `/etc/hosts` using the ips from the service.
