@section('title') 充值 @endsection

@extends('pcview::layouts.default')

@section('styles')
<link rel="stylesheet" href="{{ asset('assets/pc/css/account.css')}}"/>
@endsection

@section('content')

<div class="pay-box">
    <div class="pay-title">
        <h1 class="title"> 充值 </h1>
        <span id="open">
            <svg class="icon" aria-hidden="true"><use xlink:href="#icon-doubt"></use></svg>
            用户充值协议
        </span>
    </div>
    <div class="pay-form">
        <p class="tcolor">充值比率</p>
        <p><font color="#FF9400">1元 = {{$currency['recharge-ratio'] * 100}}{{ $config['bootstrappers']['site']['currency_name']['name'] }}</font></p>
        <p class="tcolor">设置充值金额</p>
        <div class="pay-curr">
            @if($currency['recharge-options'])
                @foreach ($currency['recharge-options'] as $item)
                    <label class="opt">¥{{$item / 100}}<input class="hide"" type="radio" name="sum" value="{{$item}}"></label>
                @endforeach
            @endif
        </div>

        <p><input min="1" oninput="value=moneyLimit(value)" onkeydown="if(!isNumber(event.keyCode)) return false;" type="number" class="custom-sum" name="custom" placeholder="自定义充值金额"></p>

        <p class="tcolor">选择充值方式</p>
        <div class="pay-way">
            <label for="alipay" class="active">
                <img src="{{ asset('assets/pc/images/pay_pic_zfb.png') }}"/>
                <input class="hide" id="alipay" type="radio" name="payway" value="AlipayWapOrder" checked>
            </label>
            <label for="wechat">
                <img src="{{ asset('assets/pc/images/pay_pic_wechat.png') }}"/>
                <input class="hide" id="wechat" type="radio" name="payway" value="WechatWapOrder">
            </label>
            @if($config['bootstrappers']['wallet:transform']['open'])
            <label for="wallet">
                <img src="{{ asset('assets/pc/images/pay_pic_wallet.png') }}"/>
                <input class="hide" id="wallet" type="radio" name="payway" value="wallet_pc_direct">
            </label>
            @endif
        </div>

        <button type="submit" class="pay-btn" id="J-pay-btn">充值</button>
        <div style="display: none" id="qrcode"></div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{asset('assets/pc/js/qrcode.min.js')}}"></script>
<script type="text/javascript">
var popInterval;
$('.pay-curr label').on('click', function(){
    $('.pay-curr label').removeClass('active');
    $(this).addClass('active');
    $('input[name="custom"]').val('');
});
$(document).on('focus keyup change', 'input[name="custom"]', function() {
    $('.pay-curr label').removeClass('active');
});

// 用户充值协议
$('#open').on('click', function () {
    var html = '<div class="out">';
    html += '<div class="agreement">';
    html += '  <div class="title">';
    html += '  <h3>用户充值协议</h3>';
    html += '  </div>';
    html += '    <div class="agreement-info">';
    html += '<p class="info">{{$currency['recharge-rule']}}</p>';
    html += '</div>';
    html += ' </div>';
    html += '</div>';
    ly.loadHtml(html,'','520','440');
});

$('input[name="custom"]').on('focus, change, keyup', function(){
    $('.pay-sum label').removeClass('active');
    $('[name="sum"]').removeAttr('checked');
})

$('.pay-way label').on('click', function(){
    $('.pay-way label').removeClass('active');
    $(this).addClass('active');
})

$('#J-pay-btn').on('click', function(){
    var _this = $(this);
    _this.attr("disabled", true);
    var sum = $('[name="sum"]:checked').val();
    var payway = $('[name="payway"]:checked').val();
    var custom = $('[name="custom"]').val();
    if (sum == undefined && custom == '') {
        _this.attr("disabled", false);
        noticebox('请输入或选择充值金额', 0);
        return;
    }

    if (payway == 'wallet_pc_direct') {
        var params = {
            amount: sum ? sum : custom * 100,
        };
        axios.post('/api/v2/plus-pay/transform', params)
        .then(function (response) {
            noticebox('充值成功', 1, "{{ route('pc:currency') }}");
        })
        .catch(function (error) {
            showError(error.response.data);
            _this.attr("disabled", false);
        });
    } else {
        var params = {
            type: payway,
            from: 1,
            url: 1,
            amount: sum ? sum : custom * 100,
            redirect: "{{ route('pc:currency') }}"
        }
        if (payway == 'WechatWapOrder') params.wechat_type = 'WechatPay_Native';

        axios.post('/api/v2/currencyRecharge/orders', params)
        .then(function (response) {
            if(payway == 'WechatWapOrder'){ // 微信支付
                var qrcode = new QRCode(document.getElementById("qrcode"),{
                    width: 150,
                    height: 150,
                });
                qrcode.makeCode(response.data.data.code_url);
                setTimeout(function () {
                    var interval = null;
                    layer.open({
                        type: 1,
                        shade: false,
                        title: false,
                        area: ['240px', '240px'],
                        content: '<div align="center" style="margin-top: 15%"><span style="display: block;text-align: center;margin-bottom: 10px">请用微信扫码支付</span>'+$('#qrcode').html()+'</div>',
                        cancel: function(){
                            $("#qrcode").empty();
                            clearInterval(interval);
                        }
                    });
                    interval = setInterval(function () {
                        axios.post('/api/v2/walletRecharge/checkWechatOrders', {out_trade_no:response.data.data.out_trade_no})
                        .then(function (response) {
                            if(response.data.message == '充值成功') {
                                window.location.href = "{{ route('pc:currency') }}";
                            }
                        })
                        .catch(function (error) {
                            showError(error.response.data);
                        });
                    }, 3000)
                }, 1);
            } else {
                window.location.href = response.data;
            }
        })
        .catch(function (error) {
            showError(error.response.data);
            _this.attr("disabled", false);
        });
    }
});
</script>
@endsection
