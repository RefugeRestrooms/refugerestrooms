FROM ruby:2.5.7-slim

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

# Specify a major version of Node.js to download and install
ENV NODEJS_MAJOR_VERSION=10

# Download and extract Node.js from archive supplied by nodejs.org
RUN curl -L https://nodejs.org/dist/latest-v$NODEJS_MAJOR_VERSION\.x/SHASUMS256.txt -O \
  && ARCHIVE_FILENAME=$(grep -o "node-*.*.*-linux-x64.tar.xz" SHASUMS256.txt) \
  && curl -L https://nodejs.org/dist/latest-v$NODEJS_MAJOR_VERSION.x/$ARCHIVE_FILENAME -o nodejs.tar.xz \
  && tar xf nodejs.tar.xz \
  && mv ./node-v*-linux-x64 /usr/local/nodejs \
  # Clean up the Node.js archive and SHASUMS256.txt
  && rm nodejs.tar.xz SHASUMS256.txt

# Add Node.js binaries to PATH (includes Node and NPM, will include Yarn)
ENV PATH="/usr/local/nodejs/bin/:${PATH}"

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
