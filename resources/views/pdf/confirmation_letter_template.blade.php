<!DOCTYPE html>
<html>
<head>
    <title>Confirmation Letter</title>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.5; font-size: 12pt; }
        .header { text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 20px; font-size: 16pt; }
        .content { margin-bottom: 20px; text-align: justify; }
        .signature-section { margin-top: 50px; width: 100%; }
        
        /* Style Tabel Tanda Tangan */
        .sig-table { width: 100%; border-collapse: collapse; border: none; }
        .sig-table td { text-align: center; vertical-align: top; padding: 10px; width: {{ 100 / count($data['signatures']) }}%; }
        
        .ttd-name { margin-top: 80px; font-weight: bold; text-decoration: underline; }
        
        /* Tabel info pihak (atas) */
        .info-table { width: 100%; border: none; margin-bottom: 10px; }
        .info-table td { vertical-align: top; padding: 2px 0; }
        .label { width: 150px; font-weight: bold; }
    </style>
</head>
<body>

    <div class="header">Confirmation Letter</div>

    <div class="content">
        <p>Confirmation letter ini dibuat dan ditandatangani pada hari {{ \Carbon\Carbon::parse($data['event_date'])->isoFormat('dddd') }}, tanggal {{ \Carbon\Carbon::parse($data['event_date'])->isoFormat('D MMMM Y') }} oleh dan antara:</p>

        <!-- Pihak Pertama -->
        <table class="info-table">
            <tr><td class="label">Nama</td><td>: {{ $data['pihak_pertama_nama'] }}</td></tr>
            <tr><td class="label">Jabatan</td><td>: {{ $data['pihak_pertama_jabatan'] }}</td></tr>
            <tr><td class="label">Nama Badan Hukum</td><td>: Perhimpunan Penghuni Mall Malang Town Square</td></tr>
            <tr><td class="label">Alamat</td><td>: Jl. Veteran no. 02 Malang</td></tr>
        </table>
        <p>Untuk selanjutnya disebut sebagai <b>“Pihak Pertama”</b>.</p>

        <!-- Pihak Kedua -->
        <table class="info-table">
            <tr><td class="label">Nama</td><td>: {{ $data['pihak_kedua_nama'] }}</td></tr>
            <tr><td class="label">Jabatan</td><td>: {{ $data['pihak_kedua_jabatan'] }}</td></tr>
            <tr><td class="label">Nama Perusahaan</td><td>: {{ $data['pihak_kedua_instansi'] }}</td></tr>
            <tr><td class="label">Alamat</td><td>: {{ $data['pihak_kedua_alamat'] }}</td></tr>
        </table>
        <p>Untuk selanjutnya disebut sebagai <b>“Pihak Kedua”</b>.</p>

        <p>Pihak Pertama dalam hal ini Malang Town Square menyatakan bersedia mensupport Pihak Kedua {{ $data['pihak_kedua_instansi'] }} sebagai salah satu Tenant Malang Town Square. Untuk itu kami dari Malang Town Square akan membantu memberikan support berupa:</p>

        <ol>
            @foreach($data['poin_support'] as $poin)
                <li>{{ $poin }}</li>
            @endforeach
        </ol>

        <p>Demikian Confirmation Letter ini dibuat sesuai dengan kesepakatan bersama yang akan digunakan sebagaimana mestinya.</p>
    </div>

    <!-- TANDA TANGAN DINAMIS -->
    <div class="signature-section">
        <table class="sig-table">
            <tr>
                @foreach($data['signatures'] as $sig)
                    <td>
                        {{ $sig['label'] }},<br>
                        @if($loop->first) Perhimpunan Penghuni Mall<br>Malang Town Square @elseif($loop->index == 1) {{ $data['pihak_kedua_instansi'] }} @else &nbsp;<br>&nbsp; @endif
                        
                        <div class="ttd-name">{{ $sig['nama'] }}</div>
                        <div>{{ $sig['jabatan'] }}</div>
                    </td>
                @endforeach
            </tr>
        </table>
    </div>

</body>
</html>