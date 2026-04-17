<?php
namespace app\model\system\search;

trait OperateLogSearch
{
    //操作人
    public function searchUserIdAttr($query, $value){
        $query->where('user_id',$value);
    }
    //请求方式
    public function searchMethodAttr($query, $value){
        $query->where('method',$value);
    }
    //操作时间
    public function searchCreateTimeAttr($query, $value){
        $query->whereTime('create_time', 'between', between_time($value));
    }
    
    //ip
    public function searchIpAttr($query, $value)
    {
        // SEC-013: 转义 LIKE 查询中的通配符，防止 SQL 注入
        $value = str_replace(['%', '_'], ['\%', '\_'], $value);
        $query->whereLike('ip', $value);
    }
}
