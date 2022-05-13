# KweenB

## Introduction

KweenB is an audio management application for the Zwerm3 project of Aifoon (BE).

## Application

There are three project that needs to be build in order to compile into OS binaries:

- `main`: The main electron application, this is basically a node application that will run native processes.
- `preload`: A safe bridge between the electron main application and the renderer. This script will run and expose API-like code that will be available in the renderer before the application starts.
- `renderer`: This is the frontend. A React application that will present the UI and will interact with the main electron application.

## Scripts

- `watch` - Starts a development server with vite and watches for changes.
- `build` - Builds the main, preload and renderer code.
- `build:main` - Builds the main code.
- `build:preload` - Builds the preload code.
- `build:renderer` - Builds the renderer code.
- `compile` - Compile the binaries.
- `typecheck` - Typecheck the main, preload and renderer project.
- `typecheck:main`- Typechecks the main project.
- `typecheck:preload`- Typechecks the preload project.
- `typecheck:renderer`- Typechecks the renderer project.

## Authors

- Tim De Paepe
- Kasper Jordaens
