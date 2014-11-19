#Contributing

### 1 Fork and clone the repository.

### 2 Install Vagrant.
https://www.vagrantup.com/downloads

### 3 Capture the powers of vagrant
  In the repo dir:
  * vagrant up
  If changes have been made since running vagrant up:
  * vagrant provision
  To login to the machine:
  * vagrant ssh

### 4 Optional tasks:
run <code>rake db:fix_accents</code> to clean up encoding problems in the safe2pee data. (Use <code>rake db:fix_accents[dry_run]</code> to preview the changes.)

### 5 Assets
* [Assets Repo](https://github.com/RefugeRestrooms/refuge_assets)

