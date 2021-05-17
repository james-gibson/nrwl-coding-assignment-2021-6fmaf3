

# Nrwl TakeHome
Getting started:
```
npm i
npm run start
```

## Acceptance Criteria
```
Build a ticket managing app, where the user can add, filter, assign, and complete tickets.

* The app should have two screens: the list screen and the details screen. Please use the Angular router to manage the transitions between them.
* Even though we tend to use NgRx for state management, you can use a different approach if you think it fits better.
* Write a couple of tests. The goal here is not to build a production-quality app, so don't test every single detail. Two or three tests should be good enough.
* Don't forget about error handling and race conditions. The API server has a random delay. If you bump it up to say 10 seconds, would the app still work correctly?
```

## How I bootstrapped this project

Skeleton and components generated via schematics
```
npx create-nx-workspace
npx ng add @angular/material
npx ng generate @angular/material:table listView
npx ng generate @angular/material:address-form detailsView
npx ng generate module app-routing --flat --module=app
```

Imported a css normalizer (github.com/necolas/normalize.css) and several util classes
Imported the provided backend service
## State Management
I opted to leverage rxjs directly for this simple app.

## What would my next steps be?
- Increased separation of concerns, the backend service for example is doing a lot in different domains
- I'd work to create smaller slices of state, either with smaller observables or a solution like NgRx
- More test coverage, both jest and adding e2e's

## What did I have to cut?
- I really wanted to add a Material UI spinner for transitions, but ran into issues getting it presented correctly
- I wanted to have more test coverage around my state logic but ran out of time
