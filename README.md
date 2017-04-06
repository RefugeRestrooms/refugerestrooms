Production CI: [![Build Status](https://travis-ci.org/RefugeRestrooms/refugerestrooms.svg?branch=master)](https://travis-ci.org/RefugeRestrooms/refugerestrooms)

Develop CI: [![Build Status](https://travis-ci.org/RefugeRestrooms/refugerestrooms.svg?branch=develop)](https://travis-ci.org/RefugeRestrooms/refugerestrooms)


[![Stories in Ready](https://badge.waffle.io/RefugeRestrooms/refugerestrooms.png?label=ready)](https://waffle.io/RefugeRestrooms/refugerestrooms)
# REFUGE restrooms

Providing safe restroom access to transgender, intersex, and gender noncomforming individuals.

REFUGE is an effort to fill the void left by the now-defunct Safe2Pee website. It provides a free resource to trans\* and queer individuals in need of gender neutral and other safe restrooms.

This project is open source. Feel free to contribute. We could use the help.

## Contributing

Changes to the site can be tested locally before deploying to the web. To get set up to edit the site and test your changes, see [`CONTRIBUTING.md`](https://github.com/RefugeRestrooms/refugerestrooms/blob/develop/CONTRIBUTING.md).

## Deployment

 This repo is set to automatically deploy to Heroku. Any time there is a merge into develop, the develop branch will be deployed to refugestaging.herokuapp.com. Any time there is a merge into master, the master branch will be released to refugerestrooms.org
 
 When making a release, you should do the following:
 1. Check the status of the app on refugestaging.herokuapp.com and make sure it's functional. 
 2. Make sure the the most recent build of develop is passing on TravisCI
 3. Run `git flow release start %{release number}`
 4. Run `git shortlog --grep "Merge pull request #" %{previous release}..HEAD` and copy the contents into a new issue with the release tag here on github. This command gives you a list of PRs merged since the previous release.
 5. `git flow release finish` and copy the contents of #4 into the release tags.
 6. `git push` in the master branch and `git push --tags`
  - this will trigger the heroku deploy to production. 
 
#### Manual Releases
Currently, we deploy to Heroku. Our application is small enough that it is free to host on Heroku, and we dont mind the server having to wake up if nobody has accessed the site in a while.

We have both a staging and a production instance on Heroku. The staging instance can be found at http://refugestaging.herokuapp.com/

Here are the steps to deploy:
 1. Talk to @tkwidmer about getting access as a collaborator for both the production and staging Heroku instances.
 2. Link your local repo to the Heroku remote repos. I suggest doing it this way:
  * `git remote add production git@heroku.com:refugerestrooms.git`
  * `git remote add staging git@heroku.com:refugestaging.git`
 3. `git flow release start %{release number}`
 4. `git push staging release/%{release number}:master` and verify your changes on staging. (run any migrations `heroku run rake db:migrate --remote staging`)
 5. Run `git shortlog --grep "Merge pull request #" %{previous release}..HEAD` and copy the contents.
 6. `git flow release finish` and copy the contents of #5 into the release tags.
 7. `git push` and `git push --tags`
 8. `git push production master` and run any migrations `heroku run rake db:migrate --remote production`

## Tech

* Ruby Version - ruby-2.3.0
* Ruby on Rails
* RSpec
* Javascript
* HTML / SASS
* Postgres
* Geocoder Gem
* Google Maps API
* Twitter Bootstrap Framework
* Deployed on Heroku

## Links to Refuge project on other platforms

- [SMS messaging Twillio Application](https://github.com/RefugeRestrooms/refugerest_sms)
- [Android Native Application](https://github.com/RefugeRestrooms/refugerestrooms-android)
- [iOS Native Application](https://github.com/RefugeRestrooms/refuge-ios)
- [Yo Application](https://github.com/raptortech-js/YoRestrooms)

## IRC

Server: irc.freenode.com
Channel: #refugerestrooms

## License

Copyright (C) 2014–2017 Teagan Widmer and contributors

This program is free software; you can redistribute and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
