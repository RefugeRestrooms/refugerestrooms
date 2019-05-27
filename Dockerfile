FROM ruby:2.5.3-slim

# Add basic binaries
RUN apt-get update \
  && apt-get install -y curl g++ gcc libfontconfig libpq-dev make patch xz-utils \
  # Clean up the apt cache
  && rm -rf /var/lib/apt/lists/*

# Download, extract and install PhantomJS from archive hosted at bitbucket
RUN curl -L https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 -O \
  # Extract and clean up the PhantomJS archive
  && tar xf phantomjs-2.1.1-linux-x86_64.tar.bz2 && rm phantomjs-2.1.1-linux-x86_64.tar.bz2 \
  # Install PhantomJS binary to /usr/local/bin
  && mv phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin \
  # Clean up extra (un-needed) PhantomJS files
  && rm -rf phantomjs-2.1.1-linux-x86_64/

# Specify a version of Node.js to download and install
ENV NODEJS_VERSION=v10.15.3

# Download and extract Node.js from archive supplied by nodejs.org
RUN curl -L https://nodejs.org/dist/$NODEJS_VERSION/node-$NODEJS_VERSION-linux-x64.tar.xz -o nodejs.tar.xz \
  && tar xf nodejs.tar.xz \
  # Clean up the Node.js archive
  && rm nodejs.tar.xz

# Add Node.js binaries to PATH (includes Node and NPM, will include Yarn)
ENV PATH="/node-$NODEJS_VERSION-linux-x64/bin/:${PATH}"

# Install Yarn
RUN npm install -g yarn

# Make the "/refugerestrooms" folder, run all subsequent commands in that folder
RUN mkdir /refugerestrooms
WORKDIR /refugerestrooms

# Install Ruby gems with Bundler
COPY Gemfile Gemfile.lock /refugerestrooms/
RUN bundle install

# Install Node.js packages with Yarn
COPY package.json yarn.lock /refugerestrooms/
RUN yarn install --pure-lockfile
