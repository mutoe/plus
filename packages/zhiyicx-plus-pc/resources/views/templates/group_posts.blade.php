@php
    use function Zhiyi\Component\ZhiyiPlus\PlusComponentPc\getTime;
    use function Zhiyi\Component\ZhiyiPlus\PlusComponentPc\getImageUrl;
    use function Zhiyi\Component\ZhiyiPlus\PlusComponentPc\formatContent;
    use function Zhiyi\Component\ZhiyiPlus\PlusComponentPc\getAvatar;
@endphp

@if(!empty($posts))
@foreach($posts as $key => $post)
@php
    $post['liked'] = $post['liked'] ?? false;
    $post['group'] = $post['group'] ?? false;
    $post['collected'] = $post['collected'] ?? false;
@endphp
<div class="feed_item" id="feed{{ $post['id'] }}">
    <div class="feed_title">
        <a class="avatar_box" href="{{ route('pc:mine', $post['user']['id']) }}">
            <img class="avatar" src="{{ getAvatar($post['user'], 50) }}" />
            @if($post['user']['verified'])
            <img class="role-icon" src="{{ $post['user']['verified']['icon'] ?? asset('assets/pc/images/vip_icon.svg') }}">
            @endif
        </a>

        <a href="javascript:;">
            <span class="feed_uname font14">{{ $post['user']['name'] }}</span>
        </a>
        <a href="{{ route('pc:grouppost', [$post['group_id'], $post['id']]) }}" class="date">
            <span class="feed_time font12">{{ getTime($post['created_at']) }}</span>
            <span class="feed_time font12 hide">查看详情</span>
        </a>
        @if(isset($post['pinned']) && $post['pinned'])
            <a class="pinned" href="javascript:;">置顶</a>
        @endif
        @if($post['excellent_at'])
        <a class="excellent" href="javascript:;">精华</a>
        @endif
    </div>

    {{-- <div class="post-title"><a href="{{ route('pc:grouppost', ['group_id' => $post['group_id'], 'post_id' => $post['id']]) }}">{{$post['title']}}</a></div> --}}
    <div class="feed_body">
        <p class="s-fc"><a href="{{ route('pc:grouppost', [$post['group_id'], $post['id']]) }}">{!! formatContent($post['title']) !!}</a></p>
        <p class="f-fs2">{!! formatContent($post['summary']) !!}</p>
        @include('pcview::templates.feed_images', ['target_url' => route('pc:grouppost', [$post['group_id'], $post['id']])])
    </div>

    <div class="feed_bottom">
        <div class="feed_datas">
            <span class="digg" id="J-likes{{$post['id']}}" rel="{{ $post['likes_count']  }}" status="{{(int) $post['liked'] ?? ''}}">
                @if($post['liked'] ?? false)
                <a href="javascript:void(0)" onclick="liked.init({{$post['id']}}, 'group', 1)">
                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-likered"></use></svg>
                    <font>{{$post['likes_count']}}</font>
                </a>
                @else
                <a href="javascript:;" onclick="liked.init({{$post['id']}}, 'group', 1)">
                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-like"></use></svg>
                    <font>{{$post['likes_count']}}</font>
                </a>
                @endif
            </span>
            <span class="comment J-comment-show">
                <svg class="icon" aria-hidden="true"><use xlink:href="#icon-comment"></use></svg>
                <font class="cs{{$post['id']}}">{{$post['comments_count']}}</font>
            </span>
            <span class="view">
                <a href="{{ route('pc:grouppost', [$post['group_id'], $post['id']]) }}">
                <svg class="icon" aria-hidden="true"><use xlink:href="#icon-chakan"></use></svg>
                </a>
                <font>{{$post['views_count']}}</font>
            </span>
            {{--@if ($post['group']['joined'])--}}
            @if ($post['user_id'] != $TS['id'] && $post['group']['joined']['disabled']) @else
                <span class="options" onclick="options(this)">
                    <svg class="icon icon-more" aria-hidden="true"><use xlink:href="#icon-more"></use></svg>
                </span>
            @endif
            <div class="options_div">
                <div class="triangle"></div>
                <ul>
                    <li onclick="repostable.show('posts', '{{$post['id']}}')">
                        <a href="javascript:;">
                            <svg class="icon" aria-hidden="true"><use xlink:href="#icon-share"></use></svg><span>转发</span>
                        </a>
                    </li>
                    @if(in_array($post['group']['joined']['role'], ['administrator', 'founder']))
                        <li>
                            @if(!$post['excellent_at'])
                            <a href="javascript:;" onclick="post.setExcellent('{{ $post['id'] }}', true)">
                                <svg class="icon" aria-hidden="true"><use xlink:href="#icon-text"></use></svg><span>设为精华</span>
                            </a>
                            @else
                            <a href="javascript:;" onclick="post.setExcellent('{{ $post['id'] }}', false)">
                                <svg class="icon" aria-hidden="true"><use xlink:href="#icon-text"></use></svg><span>取消精华</span>
                            </a>
                            @endif
                        </li>
                        <li id="J-collect{{$post['id']}}" rel="0" status="{{(int) $post['collected']}}">
                            @if($post['collected'])
                                <a class="act" href="javascript:;" onclick="collected.init({{$post['id']}}, 'group', 1);" class="act">
                                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-collect"></use></svg><span>已收藏</span>
                                </a>
                            @else
                                <a href="javascript:;" onclick="collected.init({{$post['id']}}, 'group', 1);">
                                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-collect"></use></svg><span>收藏</span>
                                </a>
                            @endif
                        </li>
                        <li>
                            @if($post['pinned'] ?? false)
                                <a href="javascript:;" onclick="post.cancelPinned('{{$post['id']}}');">
                                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-pinned"></use></svg>撤销置顶
                                </a>
                            @else
                                <a href="javascript:;" onclick="post.pinnedPost('{{$post['id']}}');">
                                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-pinned"></use></svg>置顶帖子
                                </a>
                            @endif
                        </li>
                        <li>
                            <a href="javascript:;" onclick="post.delPost('{{$post['group_id']}}', '{{$post['id']}}');">
                                <svg class="icon" aria-hidden="true"><use xlink:href="#icon-delete"></use></svg>删除
                            </a>
                        </li>
                    @else
                        <li id="J-collect{{$post['id']}}" rel="0" status="{{(int) $post['collected']}}">
                            @if($post['collected'])
                                <a class="act" href="javascript:;" onclick="collected.init({{$post['id']}}, 'group', 1);" class="act">
                                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-collect"></use></svg><span>已收藏</span>
                                </a>
                            @else
                                <a href="javascript:;" onclick="collected.init({{$post['id']}}, 'group', 1);">
                                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-collect"></use></svg><span>收藏</span>
                                </a>
                            @endif
                        </li>
                        @if($post['user_id'] == $TS['id'])
                            @if(!$post['group']['joined']['disabled'])
                            <li>
                                <a href="javascript:;" onclick="post.pinnedPost('{{$post['id']}}', 'pinned');">
                                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-pinned"></use></svg>申请置顶
                                </a>
                            </li>
                            @endif
                            <li>
                                <a href="javascript:;" onclick="post.delPost('{{$post['group_id']}}', '{{$post['id']}}');">
                                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-delete"></use></svg>删除
                                </a>
                            </li>
                        @else
                            <li>
                                <a href="javascript:;" onclick="reported.init('{{$post['id']}}', 'posts');">
                                    <svg class="icon" aria-hidden="true"><use xlink:href="#icon-report"></use></svg>
                                    <span>举报</span>
                                </a>
                            </li>
                        @endif
                    @endif
                </ul>
            </div>
        {{--@endif--}}
        </div>
         {{-- 评论 --}}
        @include('pcview::widgets.comments', [
            'id' => $post['id'],
            'comments_count' => $post['comments_count'],
            'comments_type' => 'group-posts',
            'url' => Route('pc:grouppost', [$post['group_id'], $post['id']]),
            'position' => 1,
            'top' => 1,
            'comments_data' => $post['comments'],
            'params' => ['group_id' => $post['group_id'],
            'disabled' => $post['group']['joined']['disabled']],
            'group' => $post['group'],
        ])

        <div class="feed_line"></div>
    </div>
</div>
@endforeach
@endif
