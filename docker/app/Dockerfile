FROM php:8.4-fpm-alpine

# Copy custom PHP configuration
COPY docker/app/php.ini /usr/local/etc/php/conf.d/custom.ini

# Install system dependencies
RUN apk update && apk add --no-cache \
    curl \
    git \
    libzip-dev \
    zip \
    unzip \
    bash \
    nodejs \
    npm \
    shadow

RUN usermod -u 1000 www-data && groupmod -g 1000 www-data

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install bun via npm for multi-architecture support
RUN npm install -g bun

# Set working directory
WORKDIR /var/www
