<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Confirmation Letter</title>
    <style>
        @page { 
            margin: 15mm 20mm 20mm 20mm;
        }
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.2; 
            font-size: 9pt; 
            margin: 0;
            padding: 0;
            color: #000;
        }
        
        /* HEADER - Logo Image Pojok Kiri Atas */
        .letterhead {
            margin-bottom: 15px;
        }
        .logo-img {
            height: 60px;
            width: auto;
        }
        
        .header-title { 
            text-align: center; 
            font-weight: bold; 
            margin: 20px 0 15px 0; 
            font-size: 14pt; 
        }
        
        .content { 
            margin-bottom: 12px; 
            text-align: justify; 
            font-size: 9pt;
        }
        .content p { 
            margin: 8px 0; 
            line-height: 1.4;
        }
        
        /* Tabel info pihak */
        .info-table { 
            width: 100%; 
            border: none; 
            margin: 8px 0;
            font-size: 9pt; 
        }
        .info-table td { 
            vertical-align: top; 
            padding: 1px 0; 
        }
        .label { 
            width: 180px; 
            padding-right: 10px;
        }
        
        /* Poin Support Lists */
        ol { 
            margin: 2px 0; 
            padding-left: 30px; 
            counter-reset: item;
        }
        ol li { 
            margin: 2px 0;
            line-height: 1.2;
        }
        
        .pihak-section {
            margin: 5px 0;
        }
        .pihak-section strong {
            font-size: 9pt;
            font-weight: normal;
            display: block;
            margin-bottom: 2px;
        }
        
        /* Signature Section */
        .signature-section { 
            margin-top: 30px; 
            width: 100%;
            page-break-inside: avoid;
        }
        .sig-table { 
            width: 100%; 
            border-collapse: collapse; 
            border: none; 
        }
        .sig-table td { 
            text-align: left; 
            vertical-align: top; 
            padding: 5px; 
            width: 50%; 
            font-size: 9pt;
        }
        .sig-table td strong {
            display: block;
            margin-bottom: 0;
            font-weight: bold;
            line-height: 0.9;
        }
        .sig-instansi {
            margin-bottom: 60px;
            font-weight: bold;
            line-height: 0.9;
            height: 30px;
            display: block;
        }
        .sig-instansi br {
            line-height: 0.5;
        }
        .ttd-name { 
            font-weight: bold; 
            text-decoration: underline;
            line-height: 1.1;
        }
        .ttd-jabatan {
            font-style: italic;
            margin-top: 0;
            line-height: 1.1;
        }
        
        /* FOOTER - Hanya di halaman terakhir */
        .footer-last-page {
            margin-top: 20px;
            padding-top: 5px;
            font-size: 9pt;
            line-height: 1.2;
        }
        .footer-office {
            font-size: 9pt;
            line-height: 1.2;
        }
        
        /* Prevent page break inside important sections */
        .no-break {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    @php
        // Helper function untuk convert angka ke terbilang Indonesia
        function terbilang($angka) {
            $angka = abs($angka);
            $huruf = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
            $hasil = "";
            
            if ($angka < 12) {
                $hasil = $huruf[$angka];
            } elseif ($angka < 20) {
                $hasil = terbilang($angka - 10) . " Belas";
            } elseif ($angka < 100) {
                $hasil = terbilang($angka / 10) . " Puluh " . terbilang($angka % 10);
            } elseif ($angka < 200) {
                $hasil = "Seratus " . terbilang($angka - 100);
            } elseif ($angka < 1000) {
                $hasil = terbilang($angka / 100) . " Ratus " . terbilang($angka % 100);
            } elseif ($angka < 2000) {
                $hasil = "Seribu " . terbilang($angka - 1000);
            } elseif ($angka < 1000000) {
                $hasil = terbilang($angka / 1000) . " Ribu " . terbilang($angka % 1000);
            } elseif ($angka < 1000000000) {
                $hasil = terbilang($angka / 1000000) . " Juta " . terbilang($angka % 1000000);
            }
            
            return trim($hasil);
        }
        
        \Carbon\Carbon::setLocale('id');
        $tanggalSurat = \Carbon\Carbon::parse($data['tanggal_surat']);
        $tanggalEvent = \Carbon\Carbon::parse($data['event_date']);
        
        $hariSurat = ucfirst($tanggalSurat->translatedFormat('l'));
        $tglSurat = terbilang($tanggalSurat->day);
        $bulanSurat = ucfirst($tanggalSurat->translatedFormat('F'));
        $tahunSurat = terbilang($tanggalSurat->year);
    @endphp

    <!-- LOGO POJOK KIRI ATAS (IMAGE) -->
    <div class="letterhead">
        <img src="{{ public_path('images/logo.png') }}" class="logo-img" alt="Logo Matos">
    </div>

    <!-- JUDUL SURAT (tanpa underline) -->
    <div class="header-title">Confirmation Letter</div>

    <!-- ISI SURAT -->
    <div class="content">
        <p>Confirmation letter ini dibuat dan ditandatangani pada hari {{ $hariSurat }}, tanggal {{ $tglSurat }}, bulan {{ $bulanSurat }}, tahun {{ $tahunSurat }}, ({{ $tanggalSurat->format('d/m/Y') }}) oleh dan antara:</p>

        <!-- Pihak Pertama -->
        <table class="info-table no-break">
            <tr><td class="label">1. Nama</td><td>: {{ $data['pihak_pertama_nama'] }}</td></tr>
            <tr><td class="label">&nbsp;&nbsp;&nbsp;Jabatan</td><td>: {{ $data['pihak_pertama_jabatan'] }}</td></tr>
            <tr><td class="label">&nbsp;&nbsp;&nbsp;Nama Badan Hukum</td><td>: Perhimpunan Penghuni Mall Malang Town Square</td></tr>
            <tr><td class="label">&nbsp;&nbsp;&nbsp;Alamat</td><td>: Jl. Veteran no. 02 Malang</td></tr>
        </table>
        <p style="margin-left: 20px;">Untuk selanjutnya disebut sebagai <strong>"Pihak Pertama"</strong>.</p>

        <!-- Pihak Kedua -->
        <table class="info-table no-break">
            <tr><td class="label">2. Nama</td><td>: {{ $data['pihak_kedua_nama'] }}</td></tr>
            <tr><td class="label">&nbsp;&nbsp;&nbsp;Jabatan</td><td>: {{ $data['pihak_kedua_jabatan'] }}</td></tr>
            <tr><td class="label">&nbsp;&nbsp;&nbsp;Nama Lembaga</td><td>: {{ $data['pihak_kedua_instansi'] }}</td></tr>
            <tr><td class="label">&nbsp;&nbsp;&nbsp;Alamat</td><td>: {{ $data['pihak_kedua_alamat'] }}</td></tr>
        </table>
        <p style="margin-left: 20px;">Untuk selanjutnya disebut sebagai <strong>"Pihak Kedua"</strong>.</p>

        <p>Pihak kedua dengan ini menyatakan bekerjasama dalam Kolaborasi acara di bulan {{ ucfirst($tanggalEvent->translatedFormat('F')) }} "dengan tema <em>{{ $data['tema_event'] }}</em>" yang dilaksanakan hari {{ ucfirst($tanggalEvent->translatedFormat('l')) }} tanggal {{ $tanggalEvent->format('d') }} {{ ucfirst($tanggalEvent->translatedFormat('F')) }} {{ $tanggalEvent->format('Y') }}; dengan ketentuan sebagai berikut:</p>

        <!-- Poin Support Pihak Pertama -->
        <div class="pihak-section no-break">
            <strong>Pihak Pertama:</strong>
            <ol>
                @foreach($data['poin_support_pihak_pertama'] as $poin)
                    <li>{{ $poin }}</li>
                @endforeach
            </ol>
        </div>

        <!-- Poin Support Pihak Kedua -->
        <div class="pihak-section no-break">
            <strong>Pihak Kedua:</strong>
            <ol>
                @foreach($data['poin_support_pihak_kedua'] as $poin)
                    <li>{{ $poin }}</li>
                @endforeach
            </ol>
        </div>

        <p>Demikian Confirmation Letter ini dibuat sesuai dengan kesepakatan bersama yang akan digunakan sebagaimana mestinya.</p>
    </div>

    <!-- TANDA TANGAN (rata kiri untuk Pihak Pertama) -->
    <div class="signature-section">
        <table class="sig-table">
            <tr>
                @foreach($data['signatures'] as $sig)
                    <td>
                        <div class="sig-instansi">
                            @if($loop->first) 
                                <strong>Pihak Pertama,</strong><br>
                                Perhimpunan Penghuni Mall<br>
                                Malang Town Square 
                            @elseif($loop->index == 1) 
                                <strong>Pihak Kedua,</strong><br>
                                {{ $data['pihak_kedua_instansi'] }}<br>
                                &nbsp;
                            @else
                                <strong>{{ $sig['label'] }}</strong>
                            @endif
                        </div>
                        <div class="ttd-name">{{ $sig['nama'] }}</div>
                        <div class="ttd-jabatan">{{ $sig['jabatan'] }}</div>
                    </td>
                @endforeach
            </tr>
        </table>
    </div>

    <!-- FOOTER - HANYA DI LEMBAR TERAKHIR -->
    <div class="footer-last-page">
        <div class="footer-office"><strong>Office:<br>
        Kantor Building Management<br>
        Malang Town Square</strong><br>
        Jl. Veteran no.02<br>
        Malang 65114, Jawa Timur<br>
        Phone&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: 0341-575761<br>
        Fax.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: 0341-575762</div>
    </div>

</body>
</html>
