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

You can now run and shutdown the app with:
```
docker-compose up
docker-compose down
```

It will be available at localhost:3000

### 5 Run the Tests
```
docker-compose run -e "RAILS_ENV=test" web rake db:test:prepare spec
```

### 6 Optional tasks:
To clean up encoding problems in the safe2pee data, run (Use `rake db:fix_accents[dry_run]` to preview the changes.):
```
docker-compose run rake db:fixaccents
```

### 7 Assets
* [Assets Repo](https://github.com/RefugeRestrooms/refuge_assets)

## Testing

Please cover any new code with specs. We prefer code to be covered using RSpec or Capybara.

## Now What?
Checkout our [Wiki](https://github.com/RefugeRestrooms/refugerestrooms/wiki) and specifically the [newcomers guide](https://github.com/RefugeRestrooms/refugerestrooms/wiki/Maintainers'-Manual-%5C--Newcomers'-Guide).
