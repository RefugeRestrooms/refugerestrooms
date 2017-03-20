#!/bin/bash
# This script is run from vagrant to setup packages
# It's only tested with ubuntu 14.04
set -e

REFUGE_PATH=/vagrant

# required packages
declare -A packages
packages=(
  ["git"]="=1:1.9.1-1"
  ["libreadline-dev"]=""
  ["nodejs"]="=0.10.25~dfsg2-2ubuntu1"
  ["phantomjs"]="=1.9.0-1"
  ["postgresql-server-dev-9.3"]=""
  ["postgresql-contrib-9.3"]=""
)

sudo apt-get update
for package in "${!packages[@]}"
do
  version=${packages["$package"]}
  if dpkg -s $package 2>/dev/null | grep -q "$version"; then
    echo $package' installed, skipping'
  else
    echo "installing $package, version $version..."
    sudo apt-get install -y -q $package$version
  fi
done

# Install rbenv and ruby-build
echo 'installing rbenv...'
cd
if ! [ -d .rbenv ]; then
  git clone https://github.com/sstephenson/rbenv.git .rbenv
fi
if ! grep -q '.rbenv/bin' $HOME/.bashrc; then
  echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
fi
if ! grep -q 'rbenv init' $HOME/.bashrc; then
  echo 'eval "$(rbenv init -)"' >> ~/.bashrc
fi
if ! [ -d ~/.rbenv/plugins/ruby-build ]; then
  git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build
fi
if ! grep -q ruby-build $HOME/.bashrc; then
  echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.bashrc
fi

# source .bashrc doesn't appear to be setting the path
# adding the following for now:
export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init -)"
export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"

# Install ruby
ruby_version=$(cat $REFUGE_PATH/.ruby-version | tr -d '\n\r')
if rbenv versions | grep $ruby_version; then
  echo 'ruby '$ruby_version' installed, skipping...'
else
  echo 'install ruby '$ruby_version
  rbenv install $ruby_version
fi

# Set local ruby version
rbenv local $ruby_version

# Install bundle reqs
cd $REFUGE_PATH
if which bundle | grep 1.12.15; then
  echo 'bundler installed, skipping'
else
  echo 'Installing bundler...'

  # We must target a specific version of bundler
  # which is specified in vagrant.gemspec.
  # File found here: https://github.com/mitchellh/vagrant/blob/a4c7bb822873924619f95edc9baee654fb3d6f1f/vagrant.gemspec#L23
  # Please see https://github.com/mitchellh/vagrant/issues/7193#issuecomment-204309088 for info
  gem install bundler -v 1.12.5 --no-rdoc --no-ri -q
fi
echo 'Running bundle install...'
bundle install --gemfile=$REFUGE_PATH/Gemfile

# Change permissions on pg_hba.conf
pg_hba=/etc/postgresql/9.3/main/pg_hba.conf
sudo cp "$REFUGE_PATH/setup/pg_hba.conf" $pg_hba
sudo chown postgres:postgres $pg_hba
sudo chmod 640 $pg_hba
sudo -u postgres psql -c 'select pg_reload_conf();' postgres

# Creating postres user
if ! sudo -u postgres psql -c 'SELECT rolname FROM pg_roles;' postgres | grep vagrant; then
  echo 'Creating vagrant postgres user...'
  sudo -u postgres createuser vagrant --createdb  --superuser
fi

# Seed db
echo 'Seeding db...'
bundle exec rake db:setup
