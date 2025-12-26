<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ConfirmationLetterController;
use App\Http\Controllers\EventReportController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\DashboardController; // Import Controller
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
Use App\Http\Controllers\UserController;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Redirect halaman depan ke Login
Route::get('/', function () {
    return redirect('/login');
});

// Group Route untuk User yang sudah Login & Terverifikasi
Route::middleware(['auth', 'verified'])->group(function () {

    // 1. Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware(['auth', 'verified'])
        ->name('dashboard');

    // 2. Confirmation Letter (Surat)
    Route::get('/confirmation-letter', [ConfirmationLetterController::class, 'index'])->name('confirmation.index');
    Route::post('/confirmation-letter', [ConfirmationLetterController::class, 'store'])->name('confirmation.store');
    Route::delete('/confirmation-letter/{id}', [ConfirmationLetterController::class, 'destroy'])->name('confirmation.destroy');
    Route::post('/confirmation-letter/generate', [ConfirmationLetterController::class, 'generate'])->name('confirmation.generate');
    Route::post('/confirmation-letter/preview', [ConfirmationLetterController::class, 'preview'])->name('confirmation.preview'); //

    // 3. Laporan Event
    Route::get('/laporan-event', [EventReportController::class, 'index'])->name('laporan.index');
    Route::post('/laporan-event', [EventReportController::class, 'store'])->name('laporan.store');
    Route::delete('/laporan-event/{id}', [EventReportController::class, 'destroy'])->name('laporan.destroy');

    // 4. Inventaris Marcom
    Route::get('/inventaris', [InventoryController::class, 'index'])->name('inventories.index');
    Route::post('/inventaris', [InventoryController::class, 'store'])->name('inventories.store');
    Route::patch('/inventaris/{id}', [InventoryController::class, 'update'])->name('inventories.update');
    Route::delete('/inventaris/{id}', [InventoryController::class, 'destroy'])->name('inventories.destroy');

    // 5. Budgeting Marcom
    Route::get('/budgeting', [BudgetController::class, 'index'])->name('budgeting.index');
    Route::post('/budgeting/transaction', [BudgetController::class, 'store'])->name('budgeting.store');
    Route::post('/budgeting/set-budget', [BudgetController::class, 'storeBudget'])->name('budgeting.update_budget');
    Route::get('/budgeting/export', [BudgetController::class, 'export'])->name('budgeting.export');
    Route::post('/budgeting/upload-old', [BudgetController::class, 'storeOldFile'])->name('budgeting.upload_old');
    Route::delete('/budgeting/old-file/{id}', [BudgetController::class, 'destroyOldFile'])->name('budgeting.destroy_old');

    // Route Manajemen User
    Route::resource('users', UserController::class);

});

// Group Route untuk Profil User (Bawaan Breeze)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';