<?php

namespace app\model\system;

use core\base\BaseModel;
use app\model\system\traits\{RoleDepartmentTrait, RoleMenuTrait,RoleUserTrait};

class Role extends BaseModel
{


    use RoleDepartmentTrait;
    use RoleMenuTrait;
    use RoleUserTrait;

    public const ALL_DATA = 1; // 全部数据
    public const SELF_CHOOSE = 2; // 自定义数据
    public const SELF_DATA = 3; // 本人数据
    public const DEPARTMENT_DATA = 4; // 部门数据
    public const DEPARTMENT_DOWN_DATA = 5; // 部门及以下数据


    //关键词搜索器
    public function searchKeyAttr($query, $value)
    {
        // SEC-013: 转义 LIKE 查询中的通配符，防止 SQL 注入
        $value = str_replace(['%', '_'], ['\%', '\_'], $value);
        $query->whereLike('name|role_key', $value);
    }
}
