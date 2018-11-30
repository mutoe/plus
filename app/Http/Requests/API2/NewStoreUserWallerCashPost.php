<?php

declare(strict_types=1);

/*
 * +----------------------------------------------------------------------+
 * |                          ThinkSNS Plus                               |
 * +----------------------------------------------------------------------+
 * | Copyright (c) 2018 Chengdu ZhiYiChuangXiang Technology Co., Ltd.     |
 * +----------------------------------------------------------------------+
 * | This source file is subject to version 2.0 of the Apache license,    |
 * | that is bundled with this package in the file LICENSE, and is        |
 * | available through the world-wide-web at the following url:           |
 * | http://www.apache.org/licenses/LICENSE-2.0.html                      |
 * +----------------------------------------------------------------------+
 * | Author: Slim Kit Group <master@zhiyicx.com>                          |
 * | Homepage: www.thinksns.com                                           |
 * +----------------------------------------------------------------------+
 */

namespace Zhiyi\Plus\Http\Requests\API2;

use Illuminate\Validation\Rule;
use function Zhiyi\Plus\setting;
use Zhiyi\Plus\Packages\Wallet\Wallet;
use Illuminate\Foundation\Http\FormRequest;

class NewStoreUserWallerCashPost extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return $this->user();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        $minAmountRepository = app(CashMinAmountRepository::class);
        $wallet = new Wallet($this->user());

        return [
            'value' => [
                'required',
                'numeric',
                'min:'.setting('wallet', 'cash-min-amount', 100),
                'max:'.$wallet->getWalletModel()->balance,
            ],
            'type' => [
                'required',
                Rule::in(setting('wallet', 'cash-types', [])),
            ],
            'account' => ['required'],
        ];
    }

    /**
     * Get rule messages.
     *
     * @return array
     * @author Seven Du <shiweidu@outlook.com>
     */
    public function messages()
    {
        return [
            'value.required' => '请输入提现金额',
            'value.numeric' => '发送的数据错误',
            'value.min' => '输入的提现金额不足最低提现金额要求',
            'value.max' => '提现金额超出账户余额',
            'type.required' => '请选择提现方式',
            'type.in' => '你选择的提现方式不支持',
            'account.required' => '请输入你的提现账户',
        ];
    }
}
