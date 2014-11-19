#Contributing

### 1 Fork and clone the repository.

### 2 Install Vagrant.
https://www.vagrantup.com/downloads

### 3 Capture the powers of vagrant
  * In the repo dir: <code>vagrant up</code>
  * If changes have been made since running vagrant up: <code>vagrant provision</code>
  * To login to the machine: <code>vagrant ssh</code>

### 4 Optional tasks:
run <code>rake db:fix_accents</code> to clean up encoding problems in the safe2pee data. (Use <code>rake db:fix_accents[dry_run]</code> to preview the changes.)

### 5 Assets
* [Assets Repo](https://github.com/RefugeRestrooms/refuge_assets)

