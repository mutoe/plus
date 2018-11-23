<?php
namespace Zhiyi\Component\ZhiyiPlus\PlusComponentPc\ViewComposers;

use Illuminate\View\View;
use Illuminate\Support\Facades\Cache;
use function Zhiyi\Component\ZhiyiPlus\PlusComponentPc\api;

class Ads
{
    public function compose(View $view)
    {
        $config = Cache::get('config');

        // 获取具体广告位内容
        try {
            // 避免新建站点时如果未清空缓存页面报错的问题
            $ads = api('GET', '/api/v2/advertisingspace/' . $config['ads_space'][$view['space']]['id'] . '/advertising');
        } catch (\Throwable $th) { }

        $view->with('ads', $ads);
    }
}
