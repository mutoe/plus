<?php

namespace Zhiyi\Component\ZhiyiPlus\PlusComponentPc\Controllers;

use Illuminate\Http\Request;
use Zhiyi\PlusGroup\Models\Group as GroupModel;
use function Zhiyi\Component\ZhiyiPlus\PlusComponentPc\api;
use function Zhiyi\Component\ZhiyiPlus\PlusComponentPc\formatPinneds;

class GroupController extends BaseController
{
    /**
     * 圈子首页
     * @author 28youth
     * @param  Request $request
     * @return mixed
     */
    public function index(Request $request)
    {
        $this->PlusData['current'] = 'group';
        $data['cates'] = api('GET', '/api/v2/plus-group/categories');
        $this->PlusData['TS'] && $data['my_group'] = api('GET', '/api/v2/plus-group/user-groups');

        // 圈子总数
        $data['category_id'] = $request->input('category_id', 0);
        $data['groups_count'] = GroupModel::where('audit', 1)->count();

        return view('pcview::group.index', $data, $this->PlusData);
    }

    /**
     * 创建圈子.
     *
     * @author 28youth
     * @param Request $request
     */
    public function create(Request $request)
    {
        if ($this->PlusData['config']['bootstrappers']['group:create']['need_verified'] && !$this->PlusData['TS']['verified']) {
            abort(403, '未认证用户不能创建圈子');
        }
        $data['tags'] = api('GET', '/api/v2/tags');
        $data['cates'] = api('GET', '/api/v2/plus-group/categories');

        return view('pcview::group.create', $data, $this->PlusData);
    }

    /**
     * 编辑圈子.
     *
     * @author 28youth
     * @param Request $request
     */
    public function manageGroup(Request $request)
    {
        $group_id = $request->query('group_id', 2);
        $data['tags'] = api('GET', '/api/v2/tags');
        $data['cates'] = api('GET', '/api/v2/plus-group/categories');
        $data['group'] = api('GET', '/api/v2/plus-group/groups/' . $group_id);

        return view('pcview::group.manage_edit', $data, $this->PlusData);
    }

    /**
     * 成员管理.
     *
     * @author 28youth
     * @param Request $request
     */
    public function manageMember(Request $request)
    {
        $group_id = $request->query('group_id', 2);
        $data['group'] = api('GET', '/api/v2/plus-group/groups/' . $group_id);
        $data['members'] = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/members', ['type' => 'member']);
        $data['manager'] = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/members', ['type' => 'manager']);

        return view('pcview::group.manage_member', $data, $this->PlusData);
    }

    /**
     * 圈子资金管理.
     *
     * @author 28youth
     * @param Request $request
     */
    public function bankroll(Request $request)
    {
        $group_id = $request->query('group_id', 2);
        $data['group'] = api('GET', '/api/v2/plus-group/groups/' . $group_id);
        $data['bankroll'] = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/incomes');

        return view('pcview::group.manage_bankroll', $data, $this->PlusData);
    }

    /**
     * 圈子举报管理.
     *
     * @author 28youth
     * @param Request $request
     */
    public function report(Request $request)
    {
        $group_id = $request->query('group_id', 2);
        $params = [
            'limit' => $request->query('limit', 15),
            'offset' => $request->query('offset', 0),
            'group_id' => $request->query('group_id', 2),
        ];
        $data['group'] = api('GET', '/api/v2/plus-group/groups/' . $group_id);
        $data['reports'] = api('GET', '/api/v2/plus-group/reports/', $params);

        return view('pcview::group.manage_report', $data, $this->PlusData);
    }

    /**
     * 发布帖子.
     *
     * @author 28youth
     * @param  Request $request
     * @param  int     $group_id 圈子id
     */
    public function publish(Request $request)
    {
        $template = 'publish';
        if ($request->type) {
            $template = 'publish_outside';
            $data['cates'] = api('GET', '/api/v2/plus-group/user-groups', ['type' => 'allow_post']);
        } else {
            $group_id = $request->query('group_id');
            $data['group'] = api('GET', '/api/v2/plus-group/groups/' . $group_id);
        }

        return view('pcview::group.' . $template, $data, $this->PlusData);
    }

    /**
     * 阅读公告详情.
     *
     * @author 28youth
     * @param  Request $request
     */
    public function noticeRead(Request $request)
    {
        $group_id = $request->query('group_id');
        $data['group'] = api('GET', '/api/v2/plus-group/groups/' . $group_id);

        return view('pcview::group.notice', $data, $this->PlusData);
    }

    /**
     * 圈子成员界面.
     *
     * @author 28youth
     * @param  Request $request
     */
    public function member(Request $request)
    {
        $group_id = $request->query('group_id');
        $data['group'] = api('GET', '/api/v2/plus-group/groups/' . $group_id);
        $data['members'] = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/members', ['type' => 'member']);
        $data['manager'] = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/members', ['type' => 'manager']);

        return view('pcview::group.member', $data, $this->PlusData);
    }

    /**
     * 圈子列表
     * @author 28youth
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function list(Request $request) {
        $type = $request->query('type', 'all');
        if ($type === 'excellent') {
            $params = [
                'excellent' => '1',
            ];
            $groups = api('GET', '/api/v2/plus-group/groups', $params);
        } else if ($type == 'join') {
            $params = [
                'offset' => $request->query('offset', 0),
                'limit' => $request->query('limit', 15),
            ];
            $groups = api('GET', '/api/v2/plus-group/user-groups', $params);
        } else if ($type == 'nearby') {
            $params = [
                'offset' => $request->query('offset', 0),
                'limit' => $request->query('limit', 15),
                'longitude' => $request->query('longitude'),
                'latitude' => $request->query('latitude'),
            ];
            $groups = api('GET', '/api/v2/plus-group/round/groups', $params);
        } else {
            $params = [
                'offset' => $request->query('offset', 0),
                'limit' => $request->query('limit', 15),
                'category_id' => $request->query('category_id'),
            ];
            $groups = api('GET', '/api/v2/plus-group/groups', $params);
        }

        $after = last($groups)['id'] ?? 0;
        $data['type'] = $type;
        $data['group'] = $groups;
        $groupData = view('pcview::templates.group', $data, $this->PlusData)->render();

        return response()->json([
            'status' => true,
            'data' => $groupData,
            'after' => $after,
        ]);

    }

    /**
     * 成员列表
     * @author 28youth
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function memberList(Request $request)
    {
        $group_id = $request->query('group_id', 2);
        $params = [
            'after' => $request->query('after', 0),
            'limit' => $request->query('limit', 15),
            'type' => $request->query('type', 'member'),
        ];
        $group = api('GET', '/api/v2/plus-group/groups/' . $group_id);
        $members = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/members', $params);

        $after = last($members)['id'] ?? 0;
        $data['type'] = $params['type'];
        $data['group'] = $group;
        $data['members'] = $members;
        $memberData = view('pcview::templates.group_member', $data, $this->PlusData)->render();

        return response()->json([
            'status' => true,
            'data' => $memberData,
            'after' => $after,
        ]);
    }

    /**
     * 举报列表
     * @author 28youth
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function reportList(Request $request)
    {
        $group_id = $request->query('group_id');
        $params = [
            'after' => $request->query('after', 0),
            'limit' => $request->query('limit', 15),
            'start' => strtotime($request->query('start')),
            'end' => strtotime($request->query('end')),
            'status' => $request->query('status'),
            'group_id' => $request->query('group_id'),
        ];
        $reports = api('GET', '/api/v2/plus-group/reports', $params);

        $after = last($reports)['id'] ?? 0;
        $data['reports'] = $reports;
        $data['group_id'] = $group_id;
        $data['loadcount'] = $request->query('loadcount');
        $reportData = view('pcview::templates.group_report', $data, $this->PlusData)->render();

        return response()->json([
            'status' => true,
            'after' => $after,
            'data' => $reportData,
        ]);
    }

    /**
     * 圈子财务记录.
     *
     * @author 28youth
     * @param  Request $request
     */
    public function incomes(Request $request)
    {
        $group_id = $request->query('group_id', 2);
        $params = [
            'limit' => $request->query('limit', 15),
            'after' => $request->query('after', 0),
            'type' => $request->query('type', 'all'),
            'start' => strtotime($request->query('start')),
            'end' => strtotime($request->query('end')),
        ];
        $records = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/incomes', $params);

        $after = last($records)['id'] ?? 0;
        $data['record'] = $records;
        $data['group_id'] = $group_id;
        $data['type'] = $request->query('type');
        $data['loadcount'] = $request->query('loadcount');
        $recordData = view('pcview::templates.record', $data, $this->PlusData)->render();

        return response()->json([
            'status' => true,
            'data' => $recordData,
            'after' => $after,
        ]);
    }

    /**
     * 圈子详情
     * @author ZsyD
     * @param Request $request
     * @param int $group_id [圈子id]
     * @return mixed
     */
    public function read(Request $request, int $group_id)
    {
        if ($request->isAjax) {
            $type = $request->query('type', 'post');
            if ($type === 'preview') {
                if ($request->query('offset', 0) > 0) {
                    $posts['posts'] = [];
                } else {
                    $clone = [];
                    $posts['posts'] = api('GET', '/api/v2/group/groups/' . $group_id . '/preview-posts');
                    foreach ($posts['posts'] as $post) {
                        $post['user'] = api('GET', '/api/v2/users/' . $post['user_id']);
                        $clone[] = $post;
                    }
                    $posts['posts'] = $clone;
                }
            } elseif ($type === 'excellent') {
                $params = [
                    'excellent' => '1',
                    'limit' => $request->query('limit', 15),
                    'offset' => $request->query('offset', 0),
                ];
                $posts = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/posts', $params);
            } else {
                $params = [
                    'type' => $type == 'reply' ? 'latest_reply' : 'latest_post',
                    'offset' => $request->query('offset', 0),
                    'limit' => $request->query('limit', 15),
                ];
                if ($request->keyword) { // 搜索
                    $params = [
                        'limit' => $request->query('limit', 15),
                        'offset' => $request->query('offset', 0),
                        'keyword' => $request->query('keyword'),
                        'group_id' => $group_id,
                    ];
                    $posts['posts'] = api('GET', '/api/v2/plus-group/group-posts', $params);
                    $posts['pinneds'] = [];
                } else {
                    $posts = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/posts', $params);
                }
                $posts['posts'] = formatPinneds($posts['posts'], $posts['pinneds']);
            }

            $after = 0;
            $posts['top'] = true;
            // $posts['group'] = api('GET', '/api/v2/plus-group/groups/'.$group_id);
            $feedData = view('pcview::templates.group_posts', $posts, $this->PlusData)->render();

            return response()->json([
                'status' => true,
                'data' => $feedData,
                'after' => $after,
            ]);
        }
        $data['group'] = api('GET', '/api/v2/plus-group/groups/' . $group_id);
        if ($data['group']['message'] ?? false) {
            return redirect(route('pc:group'));
        }
        $this->PlusData['current'] = 'group';

        if (!in_array($data['group']['mode'], ['paid', 'private']) || $data['group']['joined']) {
            $data['type'] = $request->query('type', 'post');
        } else {
            $data['type'] = 'preview';
        }

        $user = $this->PlusData['TS']['id'] ?? 0;
        $data['members'] = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/members', ['type' => 'member']);
        $data['manager'] = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/members', ['type' => 'manager']);

        return view('pcview::group.read', $data, $this->PlusData);
    }

    /**
     * 创建圈子动态后获取动态信息
     * @author ZsyD
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPost(Request $request)
    {
        $posts['posts'] = collect();
        $post = api('GET', '/api/v2/groups/' . $request->group_id . '/posts/' . $request->post_id);
        $posts['posts']->push($post);
        $feedData = view('pcview::templates.group_posts', $posts, $this->PlusData)->render();

        return response()->json([
            'status' => true,
            'data' => $feedData,
        ]);
    }

    /**
     * 圈子动态详情
     * @author ZsyD
     * @param  Request $request
     * @param  [type]  $group_id [圈子id]
     * @param  [type]  $post_id  [圈子动态id]
     * @return mixed
     */
    public function postDetail(Request $request, int $group_id, int $post_id)
    {
        $this->PlusData['current'] = 'group';
        
        $data['top'] = true;
        $data['post'] = api('GET', '/api/v2/plus-group/groups/' . $group_id . '/posts/' . $post_id);

        return view('pcview::group.post', $data, $this->PlusData);
    }

    /**
     * 圈子动态评论列表
     * @author ZsyD
     * @param  Request $request
     * @param  [type]  $group_id [圈子id]
     * @param  [type]  $post_id  [圈子动态id]
     * @return mixed
     */
    public function comments(Request $request, $post_id)
    {
        $group_id = $request->query('group_id', 0);
        $params = ['after' => $request->query('after', 0)];
        $comments = api('GET', '/api/v2/plus-group/group-posts/' . $post_id . '/comments', $params);
        $after = last($comments['comments'])['id'] ?? 0;
        $comments['comments'] = formatPinneds($comments['comments'], $comments['pinneds']);
        $comments['group'] = api('GET', '/api/v2/plus-group/groups/' . $group_id);
        $commentData = view('pcview::templates.comment', $comments, $this->PlusData)->render();

        return response()->json([
            'status' => true,
            'data' => $commentData,
            'after' => $after,
        ]);
    }
}
