[![CircleCI](https://circleci.com/gh/ReachFive/identity-web-core-sdk/tree/master.svg?style=svg)](https://circleci.com/gh/ReachFive/identity-web-core-sdk/tree/master)

# Reach5 Identity Web Core SDK

## Documentation

- [Installation](https://developer.reach5.co/guides/installation/web/)
- [API](https://developer.reach5.co/api/identity-web/)

## Installation
```sh
npm install --save @reachfive/identity-core
```

## NPM Publish

It should respect https://semver.org/ versionning and update [CHANGELOG.md](CHANGELOG.md)
it will be publish automaticaly by circleci

```sh
npm version [<newversion> | major | minor | patch]
git push --follow-tags
```

## NPM Publish alpha version
```sh
npm version prerelease --preid=alpha
git push --follow-tags
```
