# Flow typing the code base

This is an ongoing process. You will need [flow](https://flow.org/) and yarn. To get started:

```
yarn install
node_modules/.bin/babel login/ --out-dir build
```

# Contributing

To start we're trying to type the code base without making any large
feature changes.

This is best done by adding a `// @flow` line to the beginning of a
file, followed by fixing the resulting fallout of the `flow` command.
