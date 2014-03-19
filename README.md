[![Stories in Ready](https://badge.waffle.io/tkwidmer/refugerestrooms.png?label=ready)](https://waffle.io/tkwidmer/refugerestrooms)
# REFUGE restrooms

Providing safe restroom access for transgender, intersex, and gender noncomforming individuals.

REFUGE is an effort to fill the hole left by the now-defunct Safe2Pee website. It provides a resource for trans\* and queer individuals in need of gender neutral and other safe bathrooms.

This project is open source. Feel free to contribute. We could use the help.


## Set Up For Contributing

1. Fork and clone the repository.
2. Make sure you have Ruby 2.0 and PostgreSQL (on Mac, it's recommended to install Postgres with [homebrew](http://brew.sh/)).
3. In the repository directory run <code>bundle install</code> to install all dependencies.
4. Make sure Postgres is running, then run <code>rake db:setup</code>. This will create the development database, set it up for the application and fill it with the original safe2pee data, which you can use during development.
5. Optionally, run <code>rake db:fix_accents</code> to clean up encoding problems in the safe2pee data. (Use <code>rake db:fix_accents[dry_run]</code> to preview the changes.)

## Tech

* Ruby on Rails
* Javascript
* HTML / SASS
* Postgres
* Geocoder Gem
* Google Maps API
* Twitter Boostrap Framework
* Deployed on Heroku

## Links to Refuge projects on other platforms

[SMS messaging Twillio Application](https://github.com/tkwidmer/refugerest_sms)
[Android Native Application](https://github.com/JPumphrey/refugerestrooms-android)

## Contributors

Teagan Widmer (tkwidmer), Alicia Woitte (awoitte), Stephan Leavans (leavens9), Veronica Ray (mathonsunday), Emily Leathers (eleather), Sabra Pratt (prattsj), Justin Bull (f3ndot), Natalie Groman (nataliegroman), Pamela Ocampo (pamo), Lisa French (lisafrench), Dominic Dagradi (dominic), Carol Gunby (rakuista), Dimiter Petrov (crackofdusk), Buck Doyle (backspace), Jeanine Otter (g-knee), Caden Lovelace (neoeno), r19m89s, Miriam Knadler (mknadler), Nik Markwell (duckinator), drcable Walpole (drcable), emstans, Kyra Pranks (kxra)

## Consultants

Kelly Becker ([KellyLSB](http://www.github.com/kellyLSB))

## IRC

Server: irc.freenode.com
Channel: #refugerestrooms

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
