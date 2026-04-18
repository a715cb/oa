<?php
declare(strict_types=1);

namespace app\adminapi\validate\system;

use core\base\BaseValidate;

class DepartmentValidate extends BaseValidate
{
    protected $rule = [
        'parent_id'  => 'require|checkParentId|number|egt:0',
        'name'       => 'require|max:100|regex:/^[\x{4e00}-\x{9fa5}a-zA-Z0-9_\-\(\)\s]+$/u',
        'sort'       => 'number|between:0,9999',
        'leader_id'  => 'checkLeaderId',
    ];

    protected $message = [
        'parent_id.require'  => '上级部门不能为空',
        'parent_id.number'   => '上级部门ID必须为数字',
        'parent_id.egt'      => '上级部门ID不能为负数',
        'name.require'       => '名称不能为空',
        'name.max'           => '名称不能超过100个字符',
        'name.regex'         => '部门名称包含非法字符',
        'sort.number'        => '排序必须为数字',
        'sort.between'       => '排序只能在0~9999之间',
        'leader_id'          => '负责人ID格式不正确',
    ];

    /**
     * 校验上级部门
     * @param mixed $value 验证值
     * @param mixed $rule 验证规则
     * @param array $data 数据
     * @param string $field 验证字段名
     * @return bool|string
     */
    protected function checkParentId($value, $rule, array $data, string $field)
    {
        if (!empty($data['id']) && (int)$data['id'] === (int)$value) {
            return '上级部门不能选择自己';
        }
        return true;
    }

    /**
     * 校验负责人ID
     * @param mixed $value 验证值
     * @param mixed $rule 验证规则
     * @param array $data 数据
     * @param string $field 验证字段名
     * @return bool|string
     */
    protected function checkLeaderId($value, $rule, array $data, string $field)
    {
        if (!empty($value)) {
            $leaderId = (int)$value;
            if ($leaderId <= 0) {
                return '负责人ID格式不正确';
            }
        }
        return true;
    }
}
