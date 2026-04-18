<?php
declare(strict_types=1);

namespace app\service\system;

use core\base\BaseService;
use core\service\upload\UploadService;

/**
 * 文件服务类
 * Class FileService
 * @package app\service\system
 */
class FileService extends BaseService
{
    private UploadService $upload;

    public function __construct(UploadService $upload)
    {
        $this->upload = $upload;
    }

    /**
     * 上传文件
     * @param mixed $file 文件对象
     * @return mixed
     */
    public function uploadFile(mixed $file): mixed
    {
        return $this->upload->checkFiles()->upload($file);
    }

    /**
     * 上传图片
     * @param mixed $file 图片文件
     * @return mixed
     */
    public function uploadImg(mixed $file): mixed
    {
        return $this->upload->checkImages()->upload($file);
    }

    /**
     * 上传附件
     * @param mixed $file 附件文件
     * @return mixed
     */
    public function uploadAttachment(mixed $file): mixed
    {
        return $this->upload->checkAttachment()->upload($file);
    }
}
