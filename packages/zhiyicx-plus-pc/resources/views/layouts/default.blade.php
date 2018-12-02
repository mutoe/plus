<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="_token" content="{{ csrf_token() }}"/>
    <title>@yield('title') - {{ $config['app']['name'] ?? 'ThinkSNS Plus' }}</title>
    <meta name="keywords" content="{{ $config['app']['keywords'] ?? '' }}"/>
    <meta name="description" content="{{ $config['app']['description'] ?? '' }}"/>
    <script>
        var TS = {
            API:'{{ $routes["api"] }}',
            USER:{!! json_encode($TS) !!},
            MID: "{{ $TS['id'] ?? 0 }}",
            TOKEN: "{{ $token ?? '' }}",
            SITE_URL: "{{ config('app.url') }}",
            RESOURCE_URL: '{{ asset('assets/pc/') }}',
            BOOT: {!! json_encode($config['bootstrappers']) !!},
            EASEMOB_KEY: {!! json_encode($config['easemob_key']) !!},
            EASEMOB_USERS: {!! json_encode($easemob_users) !!},
            FILES: {!! json_encode($config['files']) !!},
            UNREAD: {},
            USER_FOLLOW_MUTUAL: [],
            HOT_TOPICS: [],
        };
        try {
            TS.CURRENCY_UNIT = TS.BOOT.site.currency_name.name;
        } catch (e) {
            TS.CURRENCY_UNIT = "积分";
        }
    </script>
    <link rel="stylesheet" href="{{ asset('assets/pc/css/common.css') }}">
    <script src="{{ asset('assets/pc/js/jquery.min.js') }}"></script>
    @yield('styles')
</head>
<body @yield('body_class')>
    <div class="wrap">
        {{-- 导航 --}}
        @include('pcview::layouts.partials.nav')

        {{-- 提示框 --}}
        <div class="noticebox">
        </div>

        {{-- 内容 --}}
        <div class="main">
            <div class="container @yield('extra_class') clearfix">
            @yield('content')
            </div>
        </div>

        <div class="right_extras">
            <a href="https://www.pgyer.com/thinksns-plus" target="_blank" class="app">  <svg class="icon" aria-hidden="true"><use xlink:href="#icon-phone"></use></svg></a>
            <a href="javascript:;" class="gotop" id="gotop"><svg class="icon" aria-hidden="true"><use xlink:href="#icon-uptop"></use></svg></a>
        </div>
    </div>

    {{-- 底部 --}}
    @include('pcview::layouts.partials.footer')

    <script>
        (function(undefined) {}).call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});
    </script>
    <script src="{{ mix('global.min.js', 'assets/pc') }}"></script>
    <script src="{{ asset('assets/pc/js/common.js') }}"></script>

    {{-- 环信 --}}
    <script src="{{ mix('easemob.min.js', 'assets/pc') }}"></script>
    <script src="{{ asset('assets/pc/js/module.easemob.js') }}"></script>
    @yield('scripts')

    {{-- 统计代码 --}}
    @if (isset($config['common']['stats_code']) && $config['common']['stats_code'] != '')
    {!! $config['common']['stats_code'] !!}
    @endif
</body>
</html>
