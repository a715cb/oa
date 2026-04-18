<?php
declare(strict_types=1);

namespace app\service\system;

use core\base\BaseService;
use app\model\system\{GenerateTable, GenerateField};
use think\facade\Db;
use core\exception\FailedException;
use core\service\generator\{GenerateService as Generator};

class GeneratorService extends BaseService
{
    protected GenerateField $fieldModel;

    public function __construct(GenerateTable $model, GenerateField $fieldModel)
    {
        $this->model = $model;
        $this->fieldModel = $fieldModel;
    }


    /**
     * 获取数据库表
     * @param array $params
     * @return array
     */
    public function getDatabaseTable(array $params): array
    {
        // 使用参数绑定防止 SQL 注入
        $whereConditions = ['1=1'];
        $bindings = [];

        if (!empty($params['table_name'])) {
            $whereConditions[] = "name LIKE :table_name";
            $bindings['table_name'] = '%' . $params['table_name'] . '%';
        }
        if (!empty($params['table_comment'])) {
            $whereConditions[] = "comment LIKE :table_comment";
            $bindings['table_comment'] = '%' . $params['table_comment'] . '%';
        }

        $whereClause = implode(' AND ', $whereConditions);
        $sql = 'SHOW TABLE STATUS WHERE ' . $whereClause;

        $result = Db::query($sql, $bindings);
        $lists = array_map("array_change_key_case", $result);
        $page = request()->param('page/d') ?: 1;
        $pageSize = request()->param('pageSize') ?: 15;
        $offset = max(0, ($page - 1) * $pageSize);
        $data = array_slice($lists, $offset, $pageSize, false);
        return [
            'current_page' => $page,
            'data' => $data,
            'total' => count($lists)
        ];
    }



    /**
     * 获取列表
     * @return array
     */
    public function getList(): array
    {
        $data = $this->model->search()->field('id,table_name,table_comment,create_time,update_time')->order('id desc')->paginate();
        return $data;
    }


    /**
     * 获取编辑的数据
     *
     * @param int $id
     * @return array
     */
    public function edit(int $id): array
    {
        $data = $this->model->with(['table_column'])->find($id);
        if (is_null($data)) {
            throw new FailedException('数据不存在或已删除');
        }
        return $data;
    }



    /**
     * 保存
     * @param array $data
     * @return int|bool
     */
    public function save(array $data): int|bool
    {
        try {
            $result = $this->withTransaction(function () use ($data) {
                $lastResult = null;
                foreach ($data as $item) {
                    // 添加主表基础信息
                    $item['template_type'] = 0;
                    $item['generate_type'] = 0;
                    $item['module_name'] = 'adminapi';
                    $item['class_dir'] = $this->getTableName($item['table_name']);
                    $item['create_userid'] = request()->uid();
                    $item['delete_type'] = 0;
                    $item['menu_pid'] = 0;
                    $item['menu_type'] = 0;
                    $item['menu_name'] = $item['table_comment'];
                    $lastResult = GenerateTable::create($item);
                    //添加字段表数据
                    $this->saveFieldData($item, $lastResult->id);
                }
                return $lastResult->id;
            }, '保存失败');
            return $result;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * 获取表名
     * @param string $table_name
     * @return string
     */
    public function getTableName(string $table_name): string
    {
        $tablePrefix = config('database.connections.mysql.prefix');
        return str_replace($tablePrefix, '', $table_name);
    }


    /**
     * 添加字段表数据
     * @param array $data
     * @param int $table_id
     */
    public function saveFieldData(array $data, int $table_id): void
    {
         // 获取当前数据表字段信息
         $column = self::getTableColumn($data['table_name']);

         $defaultColumn = ['id', 'create_time', 'update_time'];

         $insertColumn = [];
         foreach ($column as $value) {
             $required = 0;
             if ($value['notnull'] && !$value['primary'] && !in_array($value['name'], $defaultColumn)) {
                 $required = 1;
             }
             $fieldData = [
                 'table_id' => $table_id,
                 'name' => $value['name'],
                 'comment' => $value['comment'],
                 'type' => $this->getDbFieldType($value['type']),
                 'is_required' => $required,
                 'is_pk' => $value['primary'] ? 1 : 0,
             ];
             if (!in_array($value['name'], $defaultColumn)) {
                 $fieldData['is_insert'] = 1;
                 $fieldData['is_list'] = 1;
                 $fieldData['is_search'] = 1;
             }
             $insertColumn[] = $fieldData;
         }
         $this->fieldModel->saveAll($insertColumn);
    }


    /**
     * 修改
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        try {
            $this->withTransaction(function () use ($id, $data): void {
                $this->model->updateBy($id, $data);
                $this->fieldModel->saveAll($data['column']);
            }, '更新失败');
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }


    /**
     * 删除
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        try {
            $this->withTransaction(function () use ($id): void {
                GenerateTable::destroy($id);
                $this->fieldModel->where('table_id', $id)->delete();
            }, '删除失败');
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    
    /**
     * 删除字段
     * @param int $id
     * @return int
     */
    public function deleteFiled(int $id): int
    {
        return $this->fieldModel->where('id', $id)->delete();
    }




    /**
     * 获取表字段信息
     * @param string $tableName
     * @return array
     */
    public static function getTableColumn(string $tableName): array
    {
        $tablePrefix = config('database.connections.mysql.prefix');
        $tableName = str_replace($tablePrefix, '', $tableName);
        // 验证表名格式，防止注入
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $tableName)) {
            throw new FailedException('无效的表名格式');
        }
        return Db::name($tableName)->getFields();
    }



    /**
     * 生成代码
     * @param int $id
     * @return array
     */
    public function makeCode(int $id): array
    {
        $tableData = $this->model->with(['table_column'])->find($id)->toArray();
        $generator = app()->make(Generator::class);
        //删除之前生成的代码
        $generator->delGenerateDirContent();
        //生成代码
        $generator->generator($tableData);

        $zipFile = '';
        
        // 生成压缩包
        if ($tableData['generate_type'] == 0) {
            $generator->zipFile();
            $zipFile = $generator->getDownloadUrl();
        }

        return ['file' => $zipFile];
    }

    /**
     * 预览
     * @param int $id
     * @return bool|array
     */
    public function preview(int $id): array|bool
    {
        try {
            // 获取数据表信息
            $table = $this->model->with(['table_column'])->whereIn('id', $id)->findOrEmpty()->toArray();
            $generator = app()->make(Generator::class);
            return $generator->preview($table);
        } catch (\Exception $e) {
            $this->error = $e->getMessage();
            return false;
        }
    }


    /**
     * 下载文件
     * @param string $fileName
     * @return string|false
     */
    public function download(string $fileName): string|false
    {
        $cacheFileName = cache('curd_file_name' . $fileName);
        if (empty($cacheFileName)) {
            $this->error = '请重新生成代码';
            return false;
        }
        $path = root_path() . 'runtime/generate/' . $fileName;
        if (!file_exists($path)) {
            $this->error = '下载失败';
            return false;
        }
        cache('curd_file_name' . $fileName, null);

        return $path;
    }


    /**
     * 获取数据表字段类型
     * @param string $type
     * @return string
     */
    public function getDbFieldType(string $type): string
    {
        if (0 === strpos($type, 'set') || 0 === strpos($type, 'enum')) {
            $result = 'string';
        } elseif (preg_match('/(double|float|decimal|real|numeric)/is', $type)) {
            $result = 'float';
        } elseif (preg_match('/(int|serial|bit)/is', $type)) {
            $result = 'int';
        } elseif (preg_match('/bool/is', $type)) {
            $result = 'bool';
        } elseif (0 === strpos($type, 'timestamp')) {
            $result = 'timestamp';
        } elseif (0 === strpos($type, 'datetime')) {
            $result = 'datetime';
        } elseif (0 === strpos($type, 'date')) {
            $result = 'date';
        } else {
            $result = 'string';
        }
        return $result;
    }


}
