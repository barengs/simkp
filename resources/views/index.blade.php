<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SIMKP - Sistem Informasi Kerja Praktek</title>
    <link rel="shortcut icon" href="uim.jpg" type="image/jpg">
    <!-- Styles / Scripts -->
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @endif
</head>

<body class="font-sans antialiased">
    <div id="app"></div>
</body>

</html>