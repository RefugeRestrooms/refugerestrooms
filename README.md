[![Build Status](https://travis-ci.org/RefugeRestrooms/refugerestrooms.svg)](https://travis-ci.org/RefugeRestrooms/refugerestrooms) [![Stories in Ready](https://badge.waffle.io/RefugeRestrooms/refugerestrooms.png?label=ready)](https://waffle.io/RefugeRestrooms/refugerestrooms)
# REFUGE restrooms

Providing safe restroom access for transgender, intersex, and gender noncomforming individuals.

REFUGE is an effort to fill the hole left by the now-defunct Safe2Pee website. It provides a resource for trans\* and queer individuals in need of gender neutral and other safe restrooms.

This project is open source. Feel free to contribute. We could use the help.

## Deployment
Currently right now we deploy to heroku. Our application is small enough that it is free to host on Heroku, and we dont mind the server having to wake up if nobody has accessed the site in a while.

We have both a staging and a production instance on heroku. The staging instance can be found at http://refugestaging.herokuapp.com/

Here are the steps to deploy:
 1. Talk to @tkwidmer about getting access as a collaborator for both the production and staging heroku instances.
 2. Link your local repo to the heroku remote repos. I suggest doing it this way:
  * `git remote add production git@heroku.com:refugerestrooms.git`
  * `git remote add staging git@heroku.com:refugestaging.git`
 3. Merge changes into master.
 4. Pull master locally to make sure you have the latest changes. `git pull origin master`
 5. Push your changes to staging. `git push staging master`
  * run any migrations `heroku run rake db:migrate --remote staging`
 6. Verify your changes.
 7. Push your changes to production. `git push production master`
  * run any migrations `heroku run rake db:migrate --remote production`


## Tech

* Ruby Version - ruby-2.0.0-p247
* Ruby on Rails
* RSpec
* Javascript
* HTML / SASS
* Postgres
* Geocoder Gem
* Google Maps API
* Twitter Boostrap Framework
* Deployed on Heroku

## Links to Refuge project on other platforms

- [SMS messaging Twillio Application](https://github.com/RefugeRestrooms/refugerest_sms)
- [Android Native Application](https://github.com/RefugeRestrooms/refugerestrooms-android)

## IRC

Server: irc.freenode.com
Channel: #refugerestrooms

## Contributors

Teagan Widmer (tkwidmer), Alicia Woitte (awoitte), Stephan Leavans (leavens9), Veronica Ray (mathonsunday), Emily Leathers (eleather), Sabra Pratt (prattsj), Justin Bull (f3ndot), Natalie Groman (nataliegroman), Pamela Ocampo (pamo), Lisa French (lisafrench), Dominic Dagradi (dominic), Carol Gunby (rakuista), Dimiter Petrov (crackofdusk), Buck Doyle (backspace), Jeanine Otter (g-knee), Caden Lovelace (neoeno), r19m89s, Miriam Knadler (mknadler), Nik Markwell (duckinator), drcable Walpole (drcable), emstans, Kyra Pranks (kxra)

## Consultants

Kelly Becker ([KellyLSB](http://www.github.com/kellyLSB))

## License

Copyright (C) 2014 Teagan Widmer

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
