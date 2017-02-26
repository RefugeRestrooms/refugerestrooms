# Contributing

## Setting Up Development Environment

### 1 Fork and clone the repository.

### 2 Install Vagrant.
https://www.vagrantup.com/downloads.html

### 3 Capture the powers of vagrant
  * In the repo dir: <code>vagrant up</code> (Safely ignore: 'dpkg-preconfigure: unable to re-open stdin: No such file or directory')
  * If changes have been made since running vagrant up: <code>vagrant provision</code>
  * To login to the machine: <code>vagrant ssh</code>
  * `cd  /vagrant/` to navigate to the refuge repo.
  * There is a rake wrapper to execute commands in refuge repo on the vagrant machine
  without using ssh. Run `rake vagrant:shell[command]`
  * To start the rails server and bind it to the vagrant machine's IP address: `rake vagrant:shell['rails s -b 10.0.2.15']`
  * The website is available at `localhost:3000`

### 4 Optional tasks:
run <code>rake db:fix_accents</code> to clean up encoding problems in the safe2pee data. (Use <code>rake db:fix_accents[dry_run]</code> to preview the changes.)

### 5 Assets
* [Assets Repo](https://github.com/RefugeRestrooms/refuge_assets)

## Testing

Please cover any new code with specs. We prefer code to be covered using RSpec or Capybara.
