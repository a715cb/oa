<?php
namespace app\model\system\search;
use app\model\system\{Department,Role};
trait UserSearch
{
    //角色
    public function searchRolesAttr($query, $value){
        $role = Role::find($value);
        if ($role) {
            $user_id = $role->getUsers()->column('id');
            $query->whereIn('id',$user_id);
        }
    }
    //关键词
    public function searchKeyAttr($query, $value){
        // SEC-013: 转义 LIKE 查询中的通配符，防止 SQL 注入
        $value = trim($value);
        $value = str_replace(['%', '_'], ['\%', '\_'], $value);
        $query->whereLike('username|realname|pinyin', $value);
    }
    //删除状态
    public function searchStatusAttr($query, $value){
        $query->where('status',$value);
    }
    //部门
    public function searchDeptidAttr($query, $value){
        if ($value) {
            $query->whereIn('dept_id', Department::getChildrenDepartmentIds($value));
        }
    }

    //添加时间
    public function searchCreateTimeAttr($query, $value)
    {
        $query->whereTime('create_time', 'between', between_time($value));
    }
    
}
