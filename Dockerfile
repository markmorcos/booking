# syntax=docker/dockerfile:1
# check=error=true

# This Dockerfile is designed for production, not development. Use with Kamal or build'n'run by hand:
# docker build -t fr_youhanna_makin .
# docker run -d -p 80:80 -e RAILS_MASTER_KEY=<value from config/master.key> --name fr_youhanna_makin fr_youhanna_makin

# For a containerized dev environment, see Dev Containers: https://guides.rubyonrails.org/getting_started_with_devcontainer.html

# Use Ruby 3.2.2 as base image
FROM ruby:3.2.2-slim as builder

# Set environment variables
ENV RAILS_ENV=production \
    NODE_ENV=production \
    BUNDLE_WITHOUT=development:test \
    RAILS_SERVE_STATIC_FILES=true \
    RAILS_LOG_TO_STDOUT=true

# Install dependencies
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    git \
    nodejs \
    npm \
    postgresql-client \
    && npm install -g yarn \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set working directory
WORKDIR /app

# Copy Gemfile and install gems
COPY Gemfile Gemfile.lock ./
RUN bundle config set --local without 'development test' \
    && bundle install --jobs 4 --retry 3

# Install JavaScript dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy the rest of the application
COPY . .

# Precompile assets
RUN SECRET_KEY_BASE=dummy bundle exec rails assets:precompile

# Remove unnecessary files to reduce image size
RUN rm -rf node_modules tmp/cache app/assets/images spec

# Second stage: runtime image
FROM ruby:3.2.2-slim

# Install runtime dependencies
RUN apt-get update -qq && apt-get install -y \
    libpq-dev \
    postgresql-client \
    nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set environment variables
ENV RAILS_ENV=production \
    NODE_ENV=production \
    RAILS_SERVE_STATIC_FILES=true \
    RAILS_LOG_TO_STDOUT=true

# Set working directory
WORKDIR /app

# Copy from builder stage
COPY --from=builder /app /app
COPY --from=builder /usr/local/bundle /usr/local/bundle

# Expose port 3000
EXPOSE 3000

# Add a script to wait for the database and run migrations
COPY docker-entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/docker-entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Start the Rails server
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
