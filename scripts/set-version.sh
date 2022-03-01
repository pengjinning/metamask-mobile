#!/usr/bin/env bash

set -e
set -u
set -o pipefail

NAT='0|[1-9][0-9]*'
ALPHANUM='[0-9]*[A-Za-z-][0-9A-Za-z-]*'
IDENT="$NAT|$ALPHANUM"
FIELD='[0-9A-Za-z-]+'

SEMVER_REGEX="\
^[vV]?\
($NAT)\\.($NAT)\\.($NAT)\
(\\-(${IDENT})(\\.(${IDENT}))*)?\
(\\+${FIELD}(\\.${FIELD})*)?$"

# abort if values are empty
if [[ -z $SEMVER_VERSION ]]; then
  echo "SEMVER_VERSION not specified, aborting release"
  exit 1
fi

if [[ -z $VERSION_NUMBER ]]; then
  echo "VERSION_NUMBER not specified, aborting release"
  exit 1
fi

perform_updates () {
  echo -e "creating release\nsemver version: $SEMVER_VERSION\nversion number: $VERSION_NUMBER"

  # update package.json
  tmp="package.json_temp"
  jq --arg semverVersion "$SEMVER_VERSION" '.version = $semverVersion' package.json > "$tmp"
  mv "$tmp" package.json


  # update android/app/build.gradle
  sed -i -e 's/versionCode [0-9]\+/versionCode '"$VERSION_NUMBER"'/' android/app/build.gradle
  sed -i -e 's/versionName ".*"/versionName "'"$SEMVER_VERSION"'"/' android/app/build.gradle


  # update bitrise.yml
  sed -i -e 's/SEMVER_VERSION: .*/SEMVER_VERSION: '"$SEMVER_VERSION"'/' bitrise.yml
  sed -i -e 's/VERSION_NUMBER: [0-9]\+/VERSION_NUMBER: '"$VERSION_NUMBER"'/' bitrise.yml

  # update ios/MetaMask.xcodeproj/project.pbxproj
  sed -i -e 's/MARKETING_VERSION = .*/MARKETING_VERSION = '"$SEMVER_VERSION;"'/' ios/MetaMask.xcodeproj/project.pbxproj
  sed -i -e 's/CURRENT_PROJECT_VERSION = [0-9]\+/CURRENT_PROJECT_VERSION = '"$VERSION_NUMBER"'/' ios/MetaMask.xcodeproj/project.pbxproj
}

# check if SEMVER_VERSION is valid semver
if [[ $SEMVER_VERSION =~ $SEMVER_REGEX ]]; then
  echo "SEMVER_VERSION is valid"
  # check if VERSION_NUMBER is natural number
  if [[ $VERSION_NUMBER =~ $NAT ]]; then
    echo "VERSION_NUMBER is valid"
    perform_updates
  else
    echo "VERSION_NUMBER is not a number!"
    exit 1
  fi

else
  echo "SEMVER_VERSION is invalid semver!"
  exit 1
fi
