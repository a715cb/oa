<?php
declare(strict_types=1);

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\service\user\UserService;
use app\adminapi\validate\system\{UserValidate, PasswordValidate};
use app\Request;

/**
 * 用户控制器
 * Class User
 * @package app\adminapi\controller\system
 * @mixin \app\Request
 */
class User extends BaseController
{
    private UserService $service;

    public function __construct(\think\App $app, UserService $service)
    {
        parent::__construct($app);
        $this->service = $service;
    }

    /**
     * 列表
     * @return \think\Response
     */
    public function index(): \think\Response
    {
        $data = $this->service->getList();
        return $this->success($data);
    }

    /**
     * 获取激活的用户列表
     * @return \think\Response
     */
    public function getActiveUsers(): \think\Response
    {
        $data = $this->service->getActiveUsers();
        return $this->success($data);
    }

    /**
     * 新增
     * @return \think\Response
     */
    public function save(): \think\Response
    {
        $data = $this->request->param(['username','phone','email','roles','realname','dept_id','avatar']);
        $this->validateData(UserValidate::class, $data, 'add');
        return $this->executeWithResult(
            fn() => $this->service->save($data),
            '添加成功'
        );
    }

    /**
     * 获取编辑的数据
     * @param int $id 用户ID
     * @return \think\Response
     */
    public function edit(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $data = $this->service->edit($validatedId);
        return $this->success($data);
    }

    /**
     * 更新
     * @param int $id 用户ID
     * @return \think\Response
     */
    public function update(int $id): \think\Response
    {
        $data = $this->request->param(['id','email', 'roles', 'realname', 'phone', 'dept_id','avatar']);
        $this->validateData(UserValidate::class, $data, 'edit');
        return $this->executeWithResult(
            fn() => $this->service->update($id, $data),
            '更新成功'
        );
    }

    /**
     * 更新个人信息
     * @return \think\Response
     */
    public function updateInfo(): \think\Response
    {
        /** @var \app\Request $request */
        $request = request();
        $id = $request->uid();
        $data = $this->request->param(['email', 'realname', 'phone','avatar']);
        $data['id'] = $id;
        $this->validateData(UserValidate::class, $data, 'updateInfo');
        return $this->executeWithResult(
            fn() => $this->service->updateInfo($id, $data),
            '更新成功'
        );
    }

    /**
     * 根据id获取用户
     * @return \think\Response
     */
    public function getUserById(): \think\Response
    {
        $ids = $this->request->param('id');
        if (!$ids) {
            return $this->error('参数错误');
        }
        $idArray = explode(",", (string)$ids);
        $data = $this->service->getUserById($idArray);
        return $this->success($data);
    }

    /**
     * 修改密码
     * @return \think\Response
     */
    public function changePassword(): \think\Response
    {
        /** @var \app\Request $request */
        $request = request();
        $data = $this->request->param();
        $data['id'] = $request->uid();
        $this->validateData(PasswordValidate::class, $data);
        return $this->executeWithResult(
            fn() => $this->service->changePassword($data),
            '修改成功'
        );
    }

    /**
     * 重置密码
     * @param int $id 用户ID
     * @return \think\Response
     */
    public function resetPassword(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $this->validateData(UserValidate::class, ['id' => $validatedId], 'checkUser');
        return $this->executeWithResult(
            fn() => $this->service->resetPassword($validatedId),
            '重置成功'
        );
    }

    /**
     * 修改状态
     * @param int $id 用户ID
     * @return \think\Response
     */
    public function changeStatus(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $this->validateData(UserValidate::class, ['id' => $validatedId], 'checkUser');
        return $this->executeWithResult(
            fn() => $this->service->changeStatus($validatedId),
            '修改成功'
        );
    }

    /**
     * 获取用户信息
     * @return \think\Response
     */
    public function getUserInfo(): \think\Response
    {
        $data = $this->service->getUserInfo();
        return $this->success($data);
    }

    /**
     * 软删除用户
     * @param int $id 用户ID
     * @return \think\Response
     */
    public function delete(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $this->validateData(UserValidate::class, ['id' => $validatedId], 'checkUser');
        return $this->executeWithResult(
            fn() => $this->service->softDelete($validatedId),
            '删除成功'
        );
    }

    /**
     * 硬删除用户
     * @param int $id 用户ID
     * @return \think\Response
     */
    public function hardDelete(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $this->validateData(UserValidate::class, ['id' => $validatedId], 'checkUser');
        return $this->executeWithResult(
            fn() => $this->service->hardDelete($validatedId),
            '删除成功'
        );
    }

    /**
     * 恢复已删除用户
     * @param int $id 用户ID
     * @return \think\Response
     */
    public function restore(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $this->validateData(UserValidate::class, ['id' => $validatedId], 'checkUser');
        return $this->executeWithResult(
            fn() => $this->service->restore($validatedId),
            '恢复成功'
        );
    }
}
