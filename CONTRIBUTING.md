# Contributing

## Setting Up Development Environment

### 1 Fork and clone the repository.

### 2 Install Docker.
https://docs.docker.com/install/

### 3 Run the Docker Container
```
docker-compose up
```

Once up, in a separate terminal run:
```
docker-compose run web rake db:migrate
```

### 4 Run the Tests
```
docker-compose run -e "RAILS_ENV=test" web rake db:test:prepare spec cucumber
```

### 5 Optional tasks:
To clean up encoding problems in the safe2pee data, run (Use `rake db:fix_accents[dry_run]` to preview the changes.):
```
docker-compose run rake db:fixaccents
```

### 6 Assets
* [Assets Repo](https://github.com/RefugeRestrooms/refuge_assets)

## Testing

Please cover any new code with specs. We prefer code to be covered using RSpec or Capybara.

## Now What?
Checkout our [Wiki](https://github.com/RefugeRestrooms/refugerestrooms/wiki) and specifically the [newcomers guide](https://github.com/RefugeRestrooms/refugerestrooms/wiki/Maintainers'-Manual-%5C--Newcomers'-Guide).
