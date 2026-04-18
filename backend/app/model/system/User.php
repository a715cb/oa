<?php

namespace app\model\system;

use core\base\BaseModel;
use app\model\system\search\UserSearch;
use app\model\system\traits\UserRoleTrait;
use core\facade\Util;
use think\model\concern\SoftDelete;

class User extends BaseModel
{

    use UserSearch;
    use UserRoleTrait;
    use SoftDelete;

    protected $deleteTime = 'delete_time';
    protected $defaultSoftDelete = 0;

    //开启自动写入时间戳
    protected $autoWriteTimestamp = true;

    //自动写入时间戳字段
    protected $createTime = 'create_time';

    // 关闭自动写入update_time字段
    protected $updateTime = false;
    //只读字段
    protected $readonly = ['username'];

    //定义类型转换
    protected $type = [
        'create_time'  =>  'timestamp:Y/m/d',
        'must_change_password' => 'boolean',
        'is_deleted' => 'integer',
    ];

    // 判断是否需要修改密码
    public function mustChangePassword(): bool
    {
        return (bool) $this->getAttr('must_change_password');
    }

    // 判断是否为超级管理员
    public function isSuperAdmin(): bool
    {
        $superAdminId = config('system.super_admin_id');
        $roles = $this->getRolesId();
        return in_array($superAdminId, $roles);
    }

    //密码修改器
    public function setPasswordAttr($value)
    {
        return password_hash($value, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    //真实姓名修改器
    public function setRealnameAttr($value, $data)
    {
        $this->set('pinyin', Util::toPinyin($data['realname']));
        return $value;
    }

    //定义部门相对关联
    public function department()
    {
        return $this->belongsTo(Department::class, 'dept_id', 'id')->bind(['department_name' => 'name']);
    }

    //名称搜索范围
    public function scopeSearchName($query, $name)
    {
        // SEC-013: 转义 LIKE 查询中的通配符，防止 SQL 注入
        $name = trim($name);
        $name = str_replace(['%', '_'], ['\%', '\_'], $name);
        $query->whereLike('realname|pinyin', $name)->field('id,realname');
    }

}
