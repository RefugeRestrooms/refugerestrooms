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
* Suzy Framework
* Deployed on Heroku



## Dev Team

* Teagan Widmer - Ruby on Rails Eng
* Alicia Woitte - JS/CSS/HTML
* Stephan Leavens - UI/UX Design
* Pamela Ocampo - Front End Framework Setup.
* Dominic - Heroku Consulting
* Natalie Roman - Vector/Raster Design


## License

Copyright (C) 2014 Teagan Widmer

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
