# Contributing

## Setting Up Development Environment

### 1 Fork and clone the repository.
https://help.github.com/articles/fork-a-repo/

### 2 Install Docker.
- **Windows 10:** https://store.docker.com/editions/community/docker-ce-desktop-windows
- **macOS El Capitan 10.11 and newer:** https://store.docker.com/editions/community/docker-ce-desktop-mac

_(Older Mac or Windows PC? See [instructions for Docker Toolbox](https://github.com/RefugeRestrooms/refugerestrooms/wiki/How-to-use-Docker-Toolbox-with-Refuge-Restrooms).)_

_(Running Linux? See [instructions for Docker CE on Linux](https://github.com/RefugeRestrooms/refugerestrooms/wiki/How-to-use-Docker-CE-on-Linux-with-Refuge-Restrooms).)_

### 3 Build the Docker Container
Build the container from any [terminal](https://github.com/RefugeRestrooms/refugerestrooms/wiki/What-is-a-Terminal-(or-%22Terminal-Emulator%22)%3F-How-do-I-run-text-based-commands-on-my-computer%3F) program with:
```
docker-compose build
```

### 4 Run the Docker Container

You can now run the app with:
```
docker-compose up
```

If this results in a syntax error in cli.js, remove the docker image and re-run `docker-compose build` (this is especially likely to be the issue if your `docker-compose` commands got interrupted and had to be re-run a few times).

The container will be reachable at this address: `localhost:3000`

_(Point your web browser at `localhost:3000` or `127.0.0.1:3000`, or even `[IP address of computer running the container]:3000` from any computer on the same LAN. The last method is useful for testing the app/site on smart phones and tablets.)_

### 5 Do some Development

Files are shared between your computer and the Docker machine. If you update a file on your computer, the change should show up on the Docker machine, and vice-versa.

If you need to run commands on the Docker container directly, run this:
```
docker-compose run web bash
```
_(This will give you a full interactive terminal session running on the Docker machine. You can (for example) run `bundle update` to update the Gems in the Gemfile to more recent versions.)_

Occasionally, you might need to rebuild the Docker machine so it picks up major updates (such as a new version of Ruby, or an updated Gemfile). To do so, run `docker-compose down` and `docker-compose build`.

### 6 Run the Tests
```
docker-compose run -e "RAILS_ENV=test" web rake db:test:prepare spec
```
_(If you want to know if your changes pass our automated testing, before even submitting your changes to RefugeRestrooms on Github, this will let you know.)_

### 7 Shut down the Docker Container:
In another terminal window, run:
```
docker-compose down
```
_(Shutting down the container in this way is safer than exiting with `Ctrl + C` or `Cmd + C`, and prevents issues with breaking the `db` container.)_

### 8 Optional tasks:
To clean up encoding problems in the safe2pee data, run (Use `rake db:fix_accents[dry_run]` to preview the changes.):
```
docker-compose run rake db:fixaccents
```

### Assets
* [Assets Repo](https://github.com/RefugeRestrooms/refuge_assets)

## Testing

Please cover any new code with specs. We prefer code to be covered using [RSpec](https://github.com/RefugeRestrooms/refugerestrooms/wiki/What-is-RSpec%3F-How-do-I-create-unit-tests-for-Ruby-code%3F) or [Capybara](https://github.com/RefugeRestrooms/refugerestrooms/wiki/What-is-Capybara%3F-What-is-PhantomJS%3F-What-is-Poltergeist%3F).

## Now What?
Checkout our [Wiki](https://github.com/RefugeRestrooms/refugerestrooms/wiki) and specifically the [newcomers guide](https://github.com/RefugeRestrooms/refugerestrooms/wiki/Maintainers'-Manual-%5C--Newcomers'-Guide).

Please also read our [Code of Conduct](https://github.com/RefugeRestrooms/refugerestrooms/blob/develop/CODE_OF_CONDUCT.md), which gives guidance on our standards of community and interaction.
