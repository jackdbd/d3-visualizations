# d3-visualizations

[![Build Status](https://travis-ci.com/jackdbd/d3-visualizations.svg?branch=master)](https://travis-ci.com/jackdbd/d3-visualizations) [![codecov](https://codecov.io/gh/jackdbd/d3-visualizations/branch/master/graph/badge.svg)](https://codecov.io/gh/jackdbd/d3-visualizations) [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovateapp.com/) [![Code style prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

A few visualizations with D3 v5.

## :warning: Under contruction :construction:

## Installation

```shell
yarn
```

## Tests

```shell
yarn test
```

## Features

- Webpack configured as site generator with [html-webpack-plugin](https://webpack.js.org/plugins/html-webpack-plugin/) (each visualization produces its own JS/CSS bundles and inject them into the HTML template file `templates/dataviz.html`)
- Webpack configured for dev and prod environments with [webpack-merge](https://github.com/survivejs/webpack-merge)
- CSS lint with [stylelint](https://stylelint.io/)
- CSS complexity lint with [constyble](https://github.com/bartveneman/constyble)
- JS lint with [ESLint](https://eslint.org/)
- code formatting with [Prettier](https://prettier.io/)
- Tests with [jest](https://jestjs.io/en/) and [jest-dom](https://github.com/gnapse/jest-dom)
