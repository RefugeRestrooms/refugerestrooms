# Contributing

## Setting Up Development Environment

### 1 Fork and clone the repository.
https://help.github.com/articles/fork-a-repo/

### 2 Install Docker.
https://docs.docker.com/install/

### 3 Build the Docker Container
Build the container
```
docker-compose build
```

### 4 Run the Docker Container

You can now run the app from any terminal program with:
```
docker-compose up
```

It will be available at localhost:3000

_(Point your web browser at `localhost:3000` or `127.0.0.1:3000`, or even `[IP address of computer running the container]:3000` from any computer on the same LAN. The last method is useful for testing the app/site on smart phones and tablets.)_

### 5 Do some Development

```
docker-compose run web bash
```
_(This will let you run any commands you might want to run on the Docker container.)_

### 6 Run the Tests
```
docker-compose run -e "RAILS_ENV=test" web rake db:test:prepare spec
```
_(If you want to know if your changes are passing our automated testing, before even submitting your changes to RefugeRestrooms on Github, this will let you know.)_

### 7 Optional tasks:
To clean up encoding problems in the safe2pee data, run (Use `rake db:fix_accents[dry_run]` to preview the changes.):
```
docker-compose run rake db:fixaccents
```

### 8 Shut down the Docker Container:
In another terminal window, run:
```
docker-compose down
```
_(Shutting down the container in this way is safer than exiting with `Ctrl + C` or `Cmd + C`, and prevents issues with breaking the `db` container.)_

### Assets
* [Assets Repo](https://github.com/RefugeRestrooms/refuge_assets)

## Testing

Please cover any new code with specs. We prefer code to be covered using [RSpec](https://github.com/RefugeRestrooms/refugerestrooms/wiki/What-is-RSpec%3F-How-do-I-create-unit-tests-for-Ruby-code%3F) or [Capybara](https://github.com/RefugeRestrooms/refugerestrooms/wiki/What-is-Capybara%3F-What-is-PhantomJS%3F-What-is-Poltergeist%3F).

## Now What?
Checkout our [Wiki](https://github.com/RefugeRestrooms/refugerestrooms/wiki) and specifically the [newcomers guide](https://github.com/RefugeRestrooms/refugerestrooms/wiki/Maintainers'-Manual-%5C--Newcomers'-Guide).
