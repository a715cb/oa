<?php
declare(strict_types=1);

namespace app\service\system;

use core\base\BaseService;
use app\model\system\Dict;
use core\exception\FailedException;
use think\facade\{Cache, Db};

/**
 * 字典服务类
 * Class DictService
 * @package app\service\system
 */
class DictService extends BaseService
{
    public function __construct(Dict $model)
    {
        $this->model = $model;
    }

    /**
     * @var array 默认排序规则
     */
    public array $defaultOrder = ['sort' => 'asc', 'id'];

    /**
     * 获取列表
     * @return mixed
     */
    public function getList(): mixed
    {
        return $this->model->search()->where('value', '<>', Dict::CATEGORYNAME)->order($this->defaultOrder)->select();
    }

    /**
     * 获取字典数据
     * @param string|array $types 字典类型或类型数组
     * @param bool $toString 是否转换为字符串
     * @return array
     */
    public function getDictData(string|array $types, bool $toString = false): array
    {
        $data = [];
        $statusMap = $this->model->whereIn('value', $types)->column('status', 'value');
        foreach ((array)$types as $type) {
            if (isset($statusMap[$type]) && $statusMap[$type] != 1) {
                continue;
            }
            $cache = self::getCacheData($type, true);
            if ($cache === false) {
                continue;
            }
            $items = [];
            foreach ($cache as $value => $item) {
                if ($item['status'] != 1) {
                    continue;
                }
                $formattedItem = [
                    'value' => $toString ? strval($value) : $value,
                    'label' => $toString ? strval($item['name']) : $item['name']
                ];
                $items[] = $formattedItem;
            }
            is_array($types) ? $data[$type] = $items : $data = $items;
        }
        return $data;
    }

    /**
     * 新增
     * @param array $data 字典数据
     * @return int|bool
     */
    public function save(array $data): int|bool
    {
        return $this->model->storeBy($data);
    }

    /**
     * 更新字典数据
     * @param int $id 主键ID
     * @param array $data 更新数据
     * @return bool
     * @throws FailedException 业务异常
     * @throws \Exception 系统异常
     */
    public function update(int $id, array $data): bool
    {
        $dict = $this->model->findOrFail($id);
        try {
            $this->transaction(function () use ($id, $data, $dict): void {
                // 主数据更新
                $updated = $this->model->updateBy($id, $data);
                if (!$updated) {
                    throw new FailedException('更新失败');
                }

                // 如果是字典类型变更，同步关联数据
                if (isset($data['type']) && $data['type'] === Dict::CATEGORYNAME) {
                    $updateData = [
                        'type' => $data['value'],
                        'widget_type' => $data['widget_type']
                    ];
                    $this->model->where('type', $dict->value)->update($updateData);
                }
            });
            return true;
        } catch (\Exception $e) {
            throw $e instanceof FailedException ? $e : new \Exception('系统错误', 500, $e);
        }
    }

    /**
     * 更新排序
     * @param array $data 排序数据
     * @return mixed
     * @throws FailedException
     */
    public function updateSort(array $data): mixed
    {
        foreach ($data as $value) {
            if (!array_key_exists('id', $value)) {
                throw new FailedException('主键不存在');
            }
        }
        return $this->model->saveAll($data);
    }

    /**
     * 修改状态
     * @param int $id 字典ID
     * @return mixed
     */
    public function changeStatus(int $id): mixed
    {
        $this->model->findOrFail($id);
        return $this->model->disOrEnable($id);
    }

    /**
     * 删除
     * @param int $id 字典ID
     * @return bool
     */
    public function delete(int $id): bool
    {
        $dict = $this->model->findOrFail($id);
        try {
            $this->transaction(function () use ($id, $dict): void {
                $result = $this->model->deleteBy($id);
                if (!$result) {
                    throw new FailedException('删除失败');
                }
                //删除的是字典类型，同步删除关联的字典
                if ($dict->type == Dict::CATEGORYNAME) {
                    $this->model->where('type', $dict->value)->delete();
                }
            });
            return true;
        } catch (\Exception) {
            return false;
        }
    }

    /**
     * 更新字典缓存
     * @return bool
     */
    public function updateCache(): bool
    {
        // 获取所有字典数据
        $allData = $this->model->order($this->defaultOrder)->select()->toArray();
        if (empty($allData)) {
            return false;
        }
        // 将数据进行分组
        $groupedData = [];
        foreach ($allData as $item) {
            $groupedData[$item['type']][] = $item;
        }
        // 批量设置缓存
        $success = true;
        foreach ($groupedData as $type => $value) {
            $dict = [];
            foreach ($value as $v) {
                $dict[$v['value']] = $v;
            }
            $success = cache('dict_' . $type, $dict) && $success;
        }
        return $success;
    }

    /**
     * 获取缓存的字典
     * @param string $type 字典类型
     * @param bool $fullInfo 是否缓存完整值
     * @return mixed
     */
    public static function getCacheData(string $type, bool $fullInfo = false): mixed
    {
        $data = Cache::remember('dict_' . $type, function () use ($type): mixed {
            $data = Dict::where('type', $type)->order(['sort' => 'asc', 'id'])->select();
            if ($data->isEmpty()) {
                return false;
            }
            $dictData = [];
            foreach ($data->toArray() as $v) {
                $dictData[$v['value']] = $v;
            }
            return $dictData;
        });
        if (is_array($data)) {
            foreach ($data as $k => $v) {
                $val = array_pick('name,widget_type,color,status', $v);
                $data[$k] = $fullInfo ? $val : $v['name'];
            }
        }
        return $data;
    }
}
