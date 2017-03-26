# Contributing

## Setting Up Development Environment

### 1 Fork and clone the repository.

### 2 Install Vagrant.
https://www.vagrantup.com/downloads.html

### 3 Capture the powers of vagrant
  * In the repo dir: <code>vagrant up</code> (Safely ignore: 'dpkg-preconfigure: unable to re-open stdin: No such file or directory')
  * If changes have been made since running vagrant up: <code>vagrant provision</code>
  
  Please note that there are two ways to run commands in vagrant:

  1. A local `rake` wrapper that allows direct execution on the machine.
      * Run `rake vagrant:shell[command]`
      * To start the rails server using the rake wrapper use: `rake vagrant:shell['rails s -b 0.0.0.0']`.         
      * Navigate to `localhost:3000`
  2. Using `vagrant ssh` to gain access directly to the machine.
      * To login to the machine: <code>vagrant ssh</code>
      * `cd  /vagrant/` to navigate to the refuge repo.
      * To start the rails server use: `rails s -b 0.0.0.0`. 
      * Navigate to `localhost:3000`

  * To sync local changes with the vagrant machine, you can run `vagrant rsync-auto` while developing

### 4 Optional tasks:
run <code>rake db:fix_accents</code> to clean up encoding problems in the safe2pee data. (Use <code>rake db:fix_accents[dry_run]</code> to preview the changes.)

### 5 Assets
* [Assets Repo](https://github.com/RefugeRestrooms/refuge_assets)

## Testing

Please cover any new code with specs. We prefer code to be covered using RSpec or Capybara.
