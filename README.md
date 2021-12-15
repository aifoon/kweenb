# KweenB

## Introduction

KweenB is an audio management application for the Zwerm3 project of Aifoon (BE).

## Application

There are three project that needs to be build in order to compile into OS binaries:

- `main`: The main electron application, this is basically a node application that will run native processes.
- `preload`: A safe bridge between the electron main application and the renderer. This script will run and expose API-like code before the application starts.
- `renderer`: This is the frontend. A React application that will present the UI to the user and will interact with the main electron application.

## Scripts

- `dev` - Starts a development server with vite and watches for changes.
- `build` - Builds a project, minimalizing the code and adds this to a /dist folder.
- `compile:mac` - Compile for macOS.
- `typecheck` - Typecheck the main, preload and renderer project.
- `typecheck-main`- Typechecks the main project.
- `typecheck-preload`- Typechecks the preload project.
- `typecheck-renderer`- Typechecks the renderer project.

## Authors

- Tim De Paepe
- Kasper Jordaens
