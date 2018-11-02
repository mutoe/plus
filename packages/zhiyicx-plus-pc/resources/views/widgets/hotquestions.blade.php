@if(!empty($issues))
<div class="hot-issues">
    <div class="title">热门问题</div>
    <ul class="hot-issues-list">
        @foreach($issues as $issue)
        <li class="hot-title @if($loop->index < 3)top3 @endif">
            <a class="hot-issues-title" href="{{ Route('pc:questionread', $issue['id']) }}">{{$issue['subject']}}</a>
        </li>
        @endforeach
    </ul>
</div>
@endif
