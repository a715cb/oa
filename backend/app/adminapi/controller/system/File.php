<?php
declare(strict_types=1);

namespace app\adminapi\controller\system;

use core\base\BaseController;
use app\service\system\FileService;

/**
 * 文件控制器
 * Class File
 * @package app\adminapi\controller\system
 */
class File extends BaseController
{
    private FileService $service;

    public function __construct(FileService $service)
    {
        parent::__construct(app());
        $this->service = $service;
    }

    /**
     * 上传文件
     * @return \think\Response
     */
    public function uploadFile(): \think\Response
    {
        $file = $this->request->file('file');
        return $this->success($this->service->uploadFile($file));
    }

    /**
     * 上传图片
     * @return \think\Response
     */
    public function uploadImg(): \think\Response
    {
        $file = $this->request->file('file');
        return $this->success($this->service->uploadImg($file));
    }

    /**
     * 上传附件
     * @return \think\Response
     */
    public function uploadAttachment(): \think\Response
    {
        $file = $this->request->file('file');
        return $this->success($this->service->uploadAttachment($file));
    }
}
