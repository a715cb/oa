<?php
declare(strict_types=1);

namespace app\service\user;

use app\Request;
use core\base\BaseService;
use app\model\system\{User, AuthAccess, Menu};
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
     * 获取用户列表
     *
     * 性能说明：
     * - 使用 with(['roles', 'department']) 预加载关联，避免 N+1 查询问题
     * - 排除 password 字段，避免敏感数据传输和减少内存占用
     * - 使用 paginate() 分页查询，限制单次返回数据量
     * - 支持通过 is_deleted 参数切换查询正常/已删除用户
     *
     * @return array
     */
    public function getList(): array
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
     * 获取激活的用户列表
     *
     * 性能说明：
     * - 使用 cache(60) 缓存结果 60 秒，减少重复查询
     * - 仅查询必要字段 (id,realname,dept_id,avatar)，减少数据传输量
     * - 使用 with(['department']) 预加载关联，避免 N+1 查询问题
     * - 适用于首页活跃用户展示等高频读取场景
     *
     * @param array $data 查询参数
     * @return array
     */
    public function getActiveUsers(): array
    {
        return $this->model->search()->where('status', 1)->field('id,realname,dept_id,avatar')->with(['department'])->cache(60)->paginate();
    }


    /**
     * 清除用户信息缓存
     *
     * @param int $id 用户ID
     * @return void
     */
    private function clearUserInfoCache(int $id): void
    {
        $cacheKey = 'user_info_' . $id;
        cache($cacheKey, null);
    }


    /**
     * 获取用户个人信息
     *
     * 性能优化说明：
     * - 引入缓存机制（300 秒），减少频繁的用户信息和权限查询
     * - 使用 with(['department']) 预加载部门关联，避免懒加载产生的额外查询
     * - 排除不需要的字段 (password,create_time,status,pinyin)，减少内存占用
     * - 缓存 key 使用用户 ID 确保数据隔离
     * - 注意：用户更新密码、修改角色等操作后，缓存会自动失效
     *
     * @return array
     */
    public function getUserInfo(): array
    {
        /** @var \app\Request $request */
        $request = request();
        $id = $request->uid();
        $cacheKey = 'user_info_' . $id;
        
        // 尝试从缓存获取
        $cached = cache($cacheKey);
        if ($cached) {
            return $cached;
        }
        
        // 缓存未命中，查询数据库
        $user = $this->model->with(['department'])->withoutField('password,create_time,status,pinyin')->find($id);
        $role = $user->getRoles();
        $user->roles = $role->column('id');
        $user->role_name = $role->column('name');
        $user->rules = $this->getRules($role->column('id'));
        $user->avatar = $user->avatar ?: config('system.default_avatar');
        
        // 缓存结果 300 秒（5 分钟）
        cache($cacheKey, $user->toArray(), 300);
        
        return $user;
    }


    /**
     * 获取角色的权限规则
     *
     * 性能说明：
     * - 使用 whereIn 批量查询菜单权限，避免循环查询
     * - 仅查询 type 为 1 和 2 的记录，过滤不必要的数据
     * - 使用 column('rules') 直接返回规则数组，减少数据转换开销
     *
     * @param array $roles 角色id
     * @return array
     */
    private function getRules(array $roles): array
    {
        $menu_id = AuthAccess::getPermission($roles);
        // 同时查询权限类型(type=2)和有rules标识的菜单类型(type=1)
        $data = Menu::whereIn('type', [1, 2])
            ->whereIn('id', $menu_id)
            ->where('rules', '<>', '')
            ->sort('asc')
            ->column('rules');
        return $data;
    }


    /**
     * 根据 ID 批量获取用户
     *
     * 性能说明：
     * - 使用 cache(60) 缓存结果 60 秒，适用于下拉选择器等重复读取场景
     * - 仅查询 id 和 realname 字段，最小化数据传输量
     * - 使用 whereIn 批量查询，避免循环中逐个查询（N+1 问题）
     *
     * @param array $ids 用户 ID 数组
     * @return array
     */
    public function getUserById(array $ids): array
    {
        return $this->model->whereIn('id', $ids)->field('id,realname')->cache(60)->select();
    }


    /**
     * 保存用户
     *
     * 性能说明：
     * - 使用 withTransaction 确保用户和角色数据在同一事务中保存，保证数据一致性
     * - 事务执行期间会锁定相关记录，因此操作应尽量快速完成
     * - 保存成功后建议清除相关缓存（如 getActiveUsers 缓存），确保数据新鲜度
     *
     * @param array $data 用户数据
     * @return bool
     */
    public function save(array $data): bool
    {
        try {
            $this->withTransaction(function () use ($data): void {
                $data['password'] = config('system.def_password');
                $data['must_change_password'] = true;
                $this->model->storeBy($data);
                //关联保存角色数据
                $this->model->saveRoles($data['roles']);
            });
            return true;
        } catch (\Exception) {
            return false;
        }
    }


    /**
     * 获取编辑的数据
     *
     * @param int $id
     * @return array
     */
    public function edit(int $id): array
    {
        $user = $this->model->withoutField(['password'])->findOrFail($id);
        $user->roles = $user->getRolesId();
        return $user;
    }




    /**
     * 修改用户信息
     *
     * 性能说明：
     * - 使用 withTransaction 确保用户信息和角色关联在同一事务中更新
     * - 先更新用户基本信息，再更新角色关联，保证数据一致性
     * - 更新成功后建议清除该用户的缓存数据
     *
     * @param int $id 用户ID
     * @param array $data 更新数据
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        try {
            $this->withTransaction(function () use ($id, $data): void {
                $this->model->updateBy($id, $data);
                //关联更新角色的数据
                $this->model->find($id)->updateRoles($data['roles']);
            });
            
            // 事务提交成功后清除缓存
            $this->clearUserInfoCache($id);
            return true;
        } catch (\Exception) {
            return false;
        }
    }


    /**
     * 修改状态
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function changeStatus(int $id, array $data = []): bool
    {
        $result = $this->model->disOrEnable($id, $data);
        
        if ($result) {
            $this->clearUserInfoCache($id);
        }
        
        return $result;
    }


    /**
     * 修改密码
     * @param array $data
     * @return mixed
     */
    public function changePassword(array $data)
    {
        // 密码修改成功后，清除必须修改密码标志
        $result = $this->model->updateBy($data['id'], [
            'password' => $data['password'],
            'must_change_password' => false
        ]);
        
        if ($result) {
            $this->clearUserInfoCache($data['id']);
        }
        
        return $result;
    }




    /**
     * 更新个人信息
     * @param int $id
     * @param array $data
     * @return mixed
     */
    public function updateInfo(int $id, array $data)
    {
        $result = $this->model->updateBy($id, $data);
        
        if ($result) {
            $this->clearUserInfoCache($id);
        }
        
        return $result;
    }




    /**
     * 重置密码
     *
     * @param int $id
     * @return array|false
     */
    public function resetPassword(int $id): array|false
    {
        $password = config('system.def_password');
        $result = $this->model->updateBy($id, ['password' => $password]);
        
        if ($result) {
            $this->clearUserInfoCache($id);
            return ['password' => $password];
        }
        
        return false;
    }

    /**
     * 软删除用户
     * @param int $id 用户ID
     * @return bool
     * @throws FailedException
     */
    public function softDelete(int $id): bool
    {
        /** @var \app\Request $request */
        $request = request();
        $currentUserId = $request->uid();
        
        $deletionCallback = function () use ($id, $currentUserId): bool {
            $user = $this->model->with(['roles'])->findOrFail($id);

            // SEC-010: 防止删除超级管理员
            if ($user->isSuperAdmin()) {
                throw new FailedException('超级管理员不可删除');
            }

            // 防止删除自己
            if ($id == $currentUserId) {
                throw new FailedException('不可删除当前登录用户');
            }

            // 软删除用户
            $result = $user->delete();

            if (!$result) {
                throw new FailedException('删除失败');
            }

            // 记录操作日志
            $this->recordOperationLog([
                'operate' => '软删除',
                'route' => 'system:user:softDelete',
                'params' => [
                    'user_id' => $id,
                    'username' => $user->username,
                    'delete_type' => 'soft'
                ]
            ]);

            return true;
        };

        $result = $this->handleUserDeletionOperation($id, 'softDelete', $deletionCallback);
        
        if ($result) {
            $this->clearUserInfoCache($id);
        }
        
        return $result;
    }

    /**
     * 硬删除用户（永久删除）
     * @param int $id 用户ID
     * @return bool
     * @throws FailedException
     */
    public function hardDelete(int $id): bool
    {
        /** @var \app\Request $request */
        $request = request();
        $currentUserId = $request->uid();
        
        $deletionCallback = function () use ($id, $currentUserId): bool {
            // 使用 withTrashed 确保能找到已软删除的用户
            $user = $this->model->withTrashed()->findOrFail($id);

            // SEC-010: 防止删除超级管理员
            if ($user->isSuperAdmin()) {
                throw new FailedException('超级管理员不可删除');
            }

            // 防止删除自己
            if ($id == $currentUserId) {
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
            $this->recordOperationLog([
                'operate' => '硬删除',
                'route' => 'system:user:hardDelete',
                'params' => [
                    'user_id' => $id,
                    'username' => $username,
                    'delete_type' => 'hard'
                ]
            ]);

            return true;
        };

        $result = $this->handleUserDeletionOperation($id, 'hardDelete', $deletionCallback);
        
        if ($result) {
            $this->clearUserInfoCache($id);
        }
        
        return $result;
    }

    /**
     * 恢复已软删除的用户
     * @param int $id 用户ID
     * @return bool
     * @throws FailedException
     */
    public function restore(int $id): bool
    {
        $deletionCallback = function () use ($id): bool {
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
            $this->recordOperationLog([
                'operate' => '恢复用户',
                'route' => 'system:user:restore',
                'params' => [
                    'user_id' => $id,
                    'username' => $user->username
                ]
            ]);

            return true;
        };

        $result = $this->handleUserDeletionOperation($id, 'restore', $deletionCallback);
        
        if ($result) {
            $this->clearUserInfoCache($id);
        }
        
        return $result;
    }

    /**
     * 统一处理用户删除/恢复操作的事务与异常
     * 
     * @param int $_id 用户 ID（保留签名一致性）
     * @param string $operation 操作名称
     * @param callable $deletionCallback 删除/恢复操作回调
     * @return bool
     * @throws FailedException
     */
    protected function handleUserDeletionOperation(int $_id, string $operation, callable $deletionCallback): bool
    {
        try {
            $result = $this->withTransaction($deletionCallback, $operation . '失败');
            return (bool)$result;
        } catch (FailedException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new FailedException($operation . '失败: ' . $e->getMessage());
        }
    }

    /**
     * 统一记录操作日志
     * 
     * @param array $logData 日志数据，包含 operate、route、params
     */
    protected function recordOperationLog(array $logData): void
    {
        /** @var \app\Request $request */
        $request = request();
        OperateLog::create([
            'user_id' => $request->uid(),
            'module' => '用户管理',
            'method' => $request->method(),
            'operate' => $logData['operate'],
            'route' => $logData['route'],
            'params' => json_encode($logData['params'], JSON_UNESCAPED_UNICODE),
            'create_time' => time(),
            'ip' => get_client_ip()
        ]);
    }
}
