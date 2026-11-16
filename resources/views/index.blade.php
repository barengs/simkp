<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SIMKP - Sistem Informasi Kerja Praktek</title>

    <!-- Styles / Scripts -->
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @else
        <meta http-equiv="refresh" content="0; url=http://localhost:5173">
        <script>
            window.location.href = "http://localhost:5173" + window.location.pathname + window.location.search;
        </script>
    @endif
</head>

<body class="font-sans antialiased">
    <div id="app">
        @if (!file_exists(public_path('build/manifest.json')) && !file_exists(public_path('hot')))
            <div style="font-family: sans-serif; text-align: center; margin-top: 100px;">
                <p style="font-size: 18px; color: #374151;">Mengalihkan ke Frontend Vite...</p>
                <p style="font-size: 14px; color: #6b7280;">Jika browser tidak beralih otomatis, buka: <a href="http://localhost:5173" style="color: #059669; font-weight: 600;">http://localhost:5173</a></p>
            </div>
        @endif
    </div>
</body>

</html>