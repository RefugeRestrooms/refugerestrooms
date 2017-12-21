# Contributing

## Setting Up Development Environment

### 1 Fork and clone the repository.

### 2 Install Vagrant.
https://www.vagrantup.com/downloads.html

### 3 Install VirtualBox
https://www.virtualbox.org/wiki/Downloads

### 4 Capture the powers of vagrant
  * In the repo dir: <code>vagrant up</code> (Safely ignore: 'dpkg-preconfigure: unable to re-open stdin: No such file or directory')
  * If changes have been made since running vagrant up: <code>vagrant provision</code>
  
  * Start the rails server. There are two ways to do this, depending on your familiarity running from within the vagrant shell:

    1. A local `rake` wrapper that allows direct execution on the machine.
        * Run `rake vagrant:shell[command]`<sup>1</sup>
        * To start the rails server using the rake wrapper use: `rake vagrant:shell['rails s -b 0.0.0.0']`.         
        * Navigate to `localhost:3000`
    2. Using `vagrant ssh` to gain access directly to the machine.
        * To login to the machine: <code>vagrant ssh</code>
        * `cd  /vagrant/` to navigate to the refuge repo.
        * To start the rails server use: `rails s -b 0.0.0.0`. 
        * Navigate to `localhost:3000`

  [1] You can run any command locally using `rake vagrant:shell[]` and it will be executed in the repo root of the vagrant machine. You can try `rake vagrant:shell['pwd']` and see it will print the directory that the repo is in on the vagrant machine!

### 5 Optional tasks:
run <code>rake db:fix_accents</code> to clean up encoding problems in the safe2pee data. (Use <code>rake db:fix_accents[dry_run]</code> to preview the changes.)

### 6 Assets
* [Assets Repo](https://github.com/RefugeRestrooms/refuge_assets)

## Testing

Please cover any new code with specs. We prefer code to be covered using RSpec or Capybara.

## Now What?
Checkout our [Wiki](https://github.com/RefugeRestrooms/refugerestrooms/wiki) and specificly the [newcomers guide](https://github.com/RefugeRestrooms/refugerestrooms/wiki/Maintainers'-Manual-%5C--Newcomers'-Guide).
