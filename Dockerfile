FROM ruby:3.2.2-slim

# Add basic binaries
RUN apt-get update \
  && apt-get install -y curl g++ gcc libfontconfig libpq-dev make patch xz-utils chromium \
  # Clean up the apt cache
  && rm -rf /var/lib/apt/lists/*

# Specify a major version of Node.js to download and install
ENV NODEJS_MAJOR_VERSION=20

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
RUN yarn install --pure-lockfile && yarn cache clean
