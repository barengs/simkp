# Tahap 1: Ambil binary Bun dari image resmi (Sangat ringan)
FROM oven/bun:latest AS bun_stage

# Tahap 2: Image utama PHP
FROM php:8.3-fpm

# Arguments
ARG USER=alfiansyah
ARG UID=1000

# Install system dependencies dalam satu layer & langsung hapus cache
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install pdo_pgsql pdo_mysql mbstring exif pcntl bcmath gd zip \
    && echo 'upload_max_filesize = 10M' >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo 'post_max_size = 10M' >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo 'memory_limit = 128M' >> /usr/local/etc/php/conf.d/uploads.ini \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ambil Composer dari image resmi
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Ambil Bun dari stage pertama (Ini cara paling bersih & ringan)
COPY --from=bun_stage /usr/local/bin/bun /usr/local/bin/bun
COPY --from=bun_stage /usr/local/bin/bunx /usr/local/bin/bunx

# Create system user & setup folder
RUN useradd -G www-data,root -u $UID -d /home/$USER $USER \
    && mkdir -p /home/$USER/.composer /var/www \
    && chown -R $USER:$USER /home/$USER /var/www

WORKDIR /var/www

USER $USER

EXPOSE 9000
CMD ["php-fpm"]
