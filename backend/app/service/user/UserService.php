<?php

namespace app\service\user;

use core\base\BaseService;
use app\model\system\{User, AuthAccess, menu};
use app\model\system\OperateLog;
use core\exception\FailedException;
use think\facade\Db;

class UserService extends BaseService
{

    public function __construct(User $model)
    {
        $this->model = $model;
    }



    /**
     * 获取列表
     * @return array
     */
    public function getList()
    {
        $isDeleted = request()->param('is_deleted', 0);
        $query = $this->model;
        
        // 根据 is_deleted 参数切换查询范围
        if ($isDeleted == 1) {
            $query = $query->onlyTrashed();
        } else {
            $query = $query->search();
        }
        
        $data = $query->withoutField('password')
            ->order('id', 'desc')
            ->with(['roles', 'department'])
            ->paginate();
        return $data;
    }


    /**
     * 获取激活的用户
     * @param array $data
     * @return array
     */
    public function getActiveUsers()
    {
        return $this->model->search()->where('status', 1)->field('id,realname,dept_id,avatar')->with(['department'])->cache(60)->paginate();
    }


    /**
     * 获取用户信息
     * @param  $id    用户id
     * @return array
     */
    public function getUserInfo()
    {
        $id = request()->uid();
        $user = $this->model->with(['department'])->withoutField('password,create_time,status,pinyin')->find($id);
        $role = $user->getRoles();
        $user->roles = $role->column('id');
        $user->role_name = $role->column('name');
        $user->rules = $this->getRules($role->column('id'));
        $user->avatar = $user->avatar ?: config('system.default_avatar');
        return $user;
    }


    /**
     * 获取角色的权限
     * @param  $roles    角色id
     * @return array
     */
    private function getRules(array $roles)
    {
        $menu_id = AuthAccess::getPermission($roles);
        // 同时查询权限类型(type=2)和有rules标识的菜单类型(type=1)
        $data = menu::whereIn('type', [1, 2])
            ->whereIn('id', $menu_id)
            ->where('rules', '<>', '')
            ->sort('asc')
            ->column('rules');
        return $data;
    }


    /**
     * 根据id获取用户
     * @param  $id
     * @return array
     */
    public function getUserById(array $ids)
    {
        return $this->model->whereIn('id', $ids)->field('id,realname')->cache(60)->select();
    }


    /**
     * 保存
     * @param array $data
     * @return bool
     */
    public function save(array $data)
    {
        //开启事务
        $this->startTrans();
        try {
            $data['password'] = config('system.def_password');
            $data['must_change_password'] = true;
            $this->model->storeBy($data);
            //关联保存角色数据
            $this->model->saveRoles($data['roles']);
            $this->commit();  //提交事务
        } catch (\Exception $e) {
            $this->rollback();  //回滚事务
            return false;
        }
        return true;
    }


    /**
     * 获取编辑的数据
     *
     * @param  int  $id
     * @return array
     */
    public function edit($id)
    {
        $user = $this->model->withoutField(['password'])->findOrFail($id);
        $user->roles = $user->getRolesId();
        return $user;
    }




    /**
     * 修改
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update($id, array $data)
    {
        $this->startTrans();
        try {
            $this->model->updateBy($id, $data);
            //关联更新角色的数据
            $this->model->find($id)->updateRoles($data['roles']);
            $this->commit();  //提交事务
            return true;
        } catch (\Exception $e) {
            $this->rollback();  //回滚事务
            return false;
        }
    }


    /**
     * 修改状态
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function changeStatus($id)
    {
        return $this->model->disOrEnable($id);
    }


    /**
     * 修改密码
     * @param int $id
     * @param string $password
     * @return mixed
     */
    public function changePassword($data)
    {
        // 密码修改成功后，清除必须修改密码标志
        return $this->model->updateBy($data['id'], [
            'password' => $data['password'],
            'must_change_password' => false
        ]);
    }



    /**
     * 更新个人信息
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function updateInfo($id, $data)
    {
        return $this->model->updateBy($id, $data);
    }




    /**
     * 重置密码
     *
     * @return \think\Response
     */
    public function resetPassword($id)
    {
        $password = config('system.def_password');
        $result = $this->model->updateBy($id, ['password' => $password]);
        return $result ? ['password' => $password] : false;
    }

    /**
     * 软删除用户
     * @param int $id 用户ID
     * @return bool
     * @throws FailedException
     */
    public function softDelete(int $id): bool
    {
        $this->startTrans();
        try {
            $user = $this->model->with(['roles'])->findOrFail($id);

            // SEC-010: 防止删除超级管理员
            if ($user->isSuperAdmin()) {
                throw new FailedException('超级管理员不可删除');
            }

            // 防止删除自己
            if ($id == request()->uid()) {
                throw new FailedException('不可删除当前登录用户');
            }

            // 软删除用户
            $result = $user->delete();

            if (!$result) {
                throw new FailedException('删除失败');
            }

            // 记录操作日志
            $this->recordDeleteLog($id, 'soft', $user->username);

            $this->commit();
            return true;
        } catch (FailedException $e) {
            $this->rollback();
            throw $e;
        } catch (\Exception $e) {
            $this->rollback();
            throw new FailedException('删除失败: ' . $e->getMessage());
        }
    }

    /**
     * 硬删除用户（永久删除）
     * @param int $id 用户ID
     * @return bool
     * @throws FailedException
     */
    public function hardDelete(int $id): bool
    {
        $this->startTrans();
        try {
            // 使用 withTrashed 确保能找到已软删除的用户
            $user = $this->model->withTrashed()->findOrFail($id);

            // SEC-010: 防止删除超级管理员
            if ($user->isSuperAdmin()) {
                throw new FailedException('超级管理员不可删除');
            }

            // 防止删除自己
            if ($id == request()->uid()) {
                throw new FailedException('不可删除当前登录用户');
            }

            // 获取用户信息用于日志记录
            $username = $user->username;

            // 使用 Db::name 直接删除关联表记录，确保原子性和可靠性
            Db::name('user_role')->where('user_id', $id)->delete();

            // 物理删除用户（使用 force() 绕过软删除保护）
            $result = $user->force()->delete();

            if (!$result) {
                throw new FailedException('删除失败');
            }

            // 记录操作日志
            $this->recordDeleteLog($id, 'hard', $username);

            $this->commit();
            return true;
        } catch (FailedException $e) {
            $this->rollback();
            throw $e;
        } catch (\Exception $e) {
            $this->rollback();
            throw new FailedException('删除失败: ' . $e->getMessage());
        }
    }

    /**
     * 恢复已软删除的用户
     * @param int $id 用户ID
     * @return bool
     * @throws FailedException
     */
    public function restore(int $id): bool
    {
        $this->startTrans();
        try {
            // 使用 includeTrashed() 查询已删除的用户
            $user = $this->model->withTrashed()->findOrFail($id);

            // 检查用户是否已被删除
            if (!$user->trashed()) {
                throw new FailedException('该用户未被删除，无需恢复');
            }

            // 恢复用户
            $result = $user->restore();

            if (!$result) {
                throw new FailedException('恢复失败');
            }

            // 记录操作日志
            $this->recordRestoreLog($id, $user->username);

            $this->commit();
            return true;
        } catch (FailedException $e) {
            $this->rollback();
            throw $e;
        } catch (\Exception $e) {
            $this->rollback();
            throw new FailedException('恢复失败: ' . $e->getMessage());
        }
    }

    /**
     * 记录删除操作日志
     * @param int $userId 用户ID
     * @param string $deleteType 删除类型 (soft/hard)
     * @param string $username 用户名
     */
    private function recordDeleteLog(int $userId, string $deleteType, string $username): void
    {
        $typeMap = [
            'soft' => '软删除',
            'hard' => '硬删除'
        ];

        OperateLog::create([
            'user_id' => request()->uid(),
            'module' => '用户管理',
            'method' => request()->method(),
            'operate' => $typeMap[$deleteType] ?? '删除',
            'route' => 'system:user:' . $deleteType . 'Delete',
            'params' => json_encode([
                'user_id' => $userId,
                'username' => $username,
                'delete_type' => $deleteType
            ], JSON_UNESCAPED_UNICODE),
            'create_time' => time(),
            'ip' => get_client_ip()
        ]);
    }

    /**
     * 记录恢复操作日志
     * @param int $userId 用户ID
     * @param string $username 用户名
     */
    private function recordRestoreLog(int $userId, string $username): void
    {
        OperateLog::create([
            'user_id' => request()->uid(),
            'module' => '用户管理',
            'method' => request()->method(),
            'operate' => '恢复用户',
            'route' => 'system:user:restore',
            'params' => json_encode([
                'user_id' => $userId,
                'username' => $username
            ], JSON_UNESCAPED_UNICODE),
            'create_time' => time(),
            'ip' => get_client_ip()
        ]);
    }
}
