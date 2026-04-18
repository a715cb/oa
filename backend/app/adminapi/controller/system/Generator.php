<?php
declare(strict_types=1);

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\service\system\GeneratorService;
use app\adminapi\validate\system\GeneratorValidate;
use think\facade\Env;

/**
 * 代码生成器控制器
 * Class Generator
 * @package app\adminapi\controller\system
 */
class Generator extends BaseController
{
    private GeneratorService $service;

    public function __construct(GeneratorService $service, \think\App $app)
    {
        parent::__construct($app);
        $this->service = $service;
        if (Env::get('app_debug') == false) {
            $this->error('代码生成仅开发模式下可用');
        }
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
     * 获取所有的数据表
     * @return \think\Response
     */
    public function getAllTable(): \think\Response
    {
        $params = $this->request->param(['table_name', 'table_comment']);
        $data = $this->service->getDatabaseTable($params);
        return $this->success($data);
    }

    /**
     * 获取编辑的数据
     * @param int $id 表ID
     * @return \think\Response
     */
    public function edit(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $data = $this->service->edit($validatedId);
        return $this->success($data);
    }

    /**
     * 新增
     * @return \think\Response
     */
    public function save(GeneratorValidate $generatorValidate): \think\Response
    {
        $data = $generatorValidate->validated('add');
        $result = $this->service->save($data['table']);
        return $result ? $this->success(['id' => $result], '导入成功') : $this->error('导入失败');
    }

    /**
     * 更新
     * @param int $id 表ID
     * @return \think\Response
     */
    public function update(int $id, GeneratorValidate $generatorValidate): \think\Response
    {
        $validatedId = $this->validateId($id);
        $data = $generatorValidate->validated('edit');
        $result = $this->service->update($validatedId, $data);
        return $result ? $this->success('保存成功') : $this->error('保存失败');
    }

    /**
     * 删除
     * @param int $id 表ID
     * @return \think\Response
     */
    public function delete(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $result = $this->service->delete($validatedId);
        return $result ? $this->success('删除成功') : $this->error('删除失败');
    }

    /**
     * 删除字段
     * @param int $id 字段ID
     * @return \think\Response
     */
    public function deleteFiled(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $result = $this->service->deleteFiled($validatedId);
        return $result ? $this->success('删除成功') : $this->error('删除失败');
    }

    /**
     * 生成代码
     * @param int $id 表ID
     * @return \think\Response
     */
    public function makeCode(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $result = $this->service->makeCode($validatedId);
        return $result ? $this->success($result, '生成成功') : $this->error('生成失败');
    }

    /**
     * 预览代码
     * @param int $id 表ID
     * @return \think\Response
     */
    public function preview(int $id): \think\Response
    {
        $validatedId = $this->validateId($id);
        $result = $this->service->preview($validatedId);
        return $result ? $this->success($result) : $this->error($this->service->getError());
    }

    /**
     * 下载文件
     * @return mixed
     */
    public function download(): mixed
    {
        $file = $this->request->param('file');
        if (empty($file)) {
            return $this->error('文件不能为空');
        }
        $result = $this->service->download($file);
        if ($result) {
            return download($result, 'speedadmin-curd.zip');
        }
        return $this->error('下载失败');
    }
}
