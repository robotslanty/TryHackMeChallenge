# TryHackMe Dev Challenge

## Synopsis

An REST API for managing tasks.

-   REST API using NestJS on top of Express
-   User authentication is performed using JWT
-   CRUD operations for both Users and Tasks
-   Suite of e2e tests

The API solution is roughly based on a NestJS tutorial I followed sometime ago when I was first learning the framework, it's available here: https://www.youtube.com/watch?v=GHTA143_b-s

## Todo

-   Implement search
-   Implement sorting

## Installation

Clone the repository and then:

```bash
$ npm install
```

## Test

There are e2e tests for the API - these automatically spin up and remove a test MongoDB instance using docker.

```bash
# API e2e tests
$ npm run test:e2e
```

## Running the app

I've provided a docker compose file to spin up dev and test MongoDB instances depending on the requirement. For dev you can start the DB instance and app using the following:

```bash
$ npm run db:dev:up
$ npm run start:dev
```

To remove the test DB instance when you're finished use:

```bash
$ npm run db:dev:rm
```
