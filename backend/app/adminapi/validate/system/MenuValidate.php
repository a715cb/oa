<?php
declare(strict_types=1);

namespace app\adminapi\validate\system;

use core\base\BaseValidate;
use app\model\system\Menu;

class MenuValidate extends BaseValidate
{
    protected $rule = [
        'pid'       => 'require|checkParentId|number|egt:0',
        'title'     => 'require|max:100|regex:/^[\x{4e00}-\x{9fa5}a-zA-Z0-9_\-\/\s]+$/u',
        'path'      => 'require|checkRoutePath|max:255|regex:/^[a-zA-Z0-9_\-\/\.\?\=\&\#]*$/u',
        'component' => 'require|max:255|regex:/^[a-zA-Z0-9_\-\/\.]+$/u',
        'sort'      => 'number|between:0,9999',
        'open_type' => 'in:0,1,2',
        'type'      => 'in:0,1,2,3',
        'icon'      => 'checkIcon',
        'rules'     => 'max:100',
        'active_key'=> 'max:255',
        'link_url'  => 'url|max:500',
    ];

    protected $message = [
        'pid.require'         => '父级菜单必选',
        'pid.number'          => '父级菜单ID必须为数字',
        'pid.egt'             => '父级菜单ID不能为负数',
        'title.require'       => '菜单名称必填',
        'title.max'           => '菜单名称不能超过100个字符',
        'title.regex'         => '菜单名称包含非法字符',
        'path.require'        => '路由地址必填',
        'path.checkRoutePath' => '同级菜单路由地址不能重复',
        'path.max'            => '地址不能超过255个字符',
        'path.regex'          => '路径包含非法字符',
        'path.url'            => '外链地址不是一个有效的URL地址',
        'link_url.require'    => '内链地址不能为空',
        'link_url.url'        => '内链地址不是一个有效的URL地址',
        'link_url.max'        => '内链地址不能超过500个字符',
        'component.require'   => '路由组件必填',
        'component.max'       => '路由组件不能超过255个字符',
        'component.regex'     => '组件路径包含非法字符',
        'type.in'             => '菜单类型参数值错误',
        'open_type.in'        => '打开方式参数值错误',
        'icon'                => '图标名称格式不正确',
        'rules|max'           => '权限节点不能超过100个字符',
        'active_key.max'      => '高亮导航不能超过255个字符',
        'sort.between'        => '排序只能在0~9999之间',
    ];

    // 权限节点验证场景定义
    public function sceneRules(): \think\Validate
    {
        return $this->only(['title', 'pid', 'sort', 'rules'])->append('rules', 'require');
    }

    // 內链验证场景定义
    public function sceneLinkUrl(): \think\Validate
    {
        return $this->only(['title', 'pid', 'path', 'sort', 'link_url'])->append('link_url', 'require');
    }

    // 外链验证场景定义
    public function sceneExternalLink(): \think\Validate
    {
        return $this->only(['title', 'pid', 'path', 'sort'])->append('path', 'url');
    }

    /**
     * 同级菜单路由地址不能重复
     * @param mixed $value 验证值
     * @param mixed $rule 验证规则
     * @param array $data 数据
     * @param string $field 验证字段名
     * @return bool|string
     */
    protected function checkRoutePath($value, $rule, array $data, string $field)
    {
        $map = [];
        $map[] = ['path', '=', $value];
        $map[] = ['pid', '=', $data['pid']];
        if (isset($data['id']) && !empty($data['id'])) {
            $map[] = ['id', '<>', $data['id']];
        }
        $count = Menu::where($map)->count();
        if ($count > 0) {
            return false;
        }
        return true;
    }

    /**
     * 校验上级菜单
     * @param mixed $value 验证值
     * @param mixed $rule 验证规则
     * @param array $data 数据
     * @param string $field 验证字段名
     * @return bool|string
     */
    protected function checkParentId($value, $rule, array $data, string $field)
    {
        if (!empty($data['id']) && (int)$data['id'] === (int)$value) {
            return '上级菜单不能选择自己';
        }
        return true;
    }

    /**
     * 校验图标格式
     * @param mixed $value 验证值
     * @param mixed $rule 验证规则
     * @param array $data 数据
     * @param string $field 验证字段名
     * @return bool|string
     */
    protected function checkIcon($value, $rule, array $data, string $field)
    {
        if (!empty($value)) {
            $icon = trim($value);
            if (mb_strlen($icon) > 100) {
                return '图标名称长度超出限制';
            }
            if (!preg_match('/^[a-z0-9\-]+$/u', $icon)) {
                return '图标名称格式不正确';
            }
        }
        return true;
    }
}
