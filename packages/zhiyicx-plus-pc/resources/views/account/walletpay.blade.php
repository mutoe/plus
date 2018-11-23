@section('title') 充值 @endsection

@extends('pcview::layouts.default')

@section('styles')
<link rel="stylesheet" href="{{ asset('assets/pc/css/account.css')}}"/>
@endsection

@section('content')

<div class="pay-box">
    <h1 class="title"> 充值 </h1>
    <div class="pay-form">

        <p class="tcolor">设置充值金额</p>
        @if ($wallet && isset($wallet['labels']))
        <div class="pay-sum">
            @foreach ($wallet['labels'] as $label)
            <label class="opt">¥{{ $label / 100 }}<input class="hide" type="radio" name="sum" value="{{ $label }}"></label>
            @endforeach
        </div>
        @endif

        <p><input min="1" oninput="value=moneyLimit(value)" class="custom-sum" type="number" name="custom" placeholder="自定义充值金额"></p>

        <p class="tcolor">选择充值方式</p>
        <div class="pay-way">
            <label for="alipay">
                <img src="{{ asset('assets/pc/images/pay_pic_zfb.png') }}"/>
                <input class="hide" id="alipay" type="radio" name="payway" value="AlipayWapOrder" checked>
            </label>
            <label for="wallet">
                <img src="{{ asset('assets/pc/images/pay_pic_wechat.png') }}"/>
                <input class="hide" id="weixing" type="radio" name="payway" value="WechatWapOrder">
            </label>
        </div>

        <a href="#" class="pay-btn perfect_btn save J-authenticate-btn" id="J-pay-btn">充值</a>
        <div style="display: none" id="qrcode"></div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{asset('assets/pc/js/qrcode.min.js')}}"></script>
<script src="{{asset('assets/pc/js/layer.js')}}"></script>
<script type="text/javascript">
var popInterval;
$('.pay-sum label').on('click', function(){
    $('.pay-sum label').removeClass('active');
    $(this).addClass('active');

    $('input[name="custom"]').val('');
})

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
    if(sum == undefined){
        noticebox('请选择或输入金额',0);return;
    }
    var payway = $('.pay-way .active input').val();
    if(payway == undefined){
        noticebox('请选择支付方式',0);return;
    }
    var custom = $('[name="custom"]').val();

    var params = {
        type: payway,
        from: 1,
        url: 1,
        amount: sum ? sum : custom * 100,
        wechat_type: 'WechatPay_Native'
    }

    axios.post('/api/v2/walletRecharge/orders', params)
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
                            window.location.href = "{{ route('pc:wallet') }}";
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
});
</script>
@endsection