<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Fix: Gunakan instance() untuk memaksa override path public ke root project (public_html)
        // bind() tidak bekerja karena path.public sudah di-set sebagai instance saat aplikasi booting
        $this->app->instance('path.public', base_path());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
