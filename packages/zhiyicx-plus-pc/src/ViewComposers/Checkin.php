<?php
namespace Zhiyi\Component\ZhiyiPlus\PlusComponentPc\ViewComposers;

use Illuminate\View\View;
use Illuminate\Support\Facades\Cache;
use function Zhiyi\Component\ZhiyiPlus\PlusComponentPc\api;

class CheckIn
{
    public function compose(View $view)
    {
        $config = Cache::get('config');

        if ($config['bootstrappers']['checkin']['switch']) {
            $data = api('GET', '/api/v2/user/checkin');
            $data['checked_in'] = isset($data['checked_in']) && $data['checked_in'] ? 1 : 0;
            $view->with('data', $data);
        }
    }
}