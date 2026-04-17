<?php

namespace core\service\upload;

use think\exception\{ValidateException, HttpResponseException};
use core\service\upload\Filesystem;
use think\file\UploadedFile;
use app\model\system\File;
use think\facade\Config;
use think\Response;

class UploadService
{

    /**
     * 支持的驱动列表
     */
    public const DRIVERS = [
        'oss' => '阿里云',
        'qcloud' => '腾讯云',
        'qiniu' => '七牛',
        'local' => '本地'
    ];

    /**
     * 上传驱动
     */
    protected $driver;

    /**
     * 上传路径
     */
    protected string $path = 'uploads';

    /**
     * 上传文件
     *
     * @param UploadedFile $file
     * @return array
     * @throws \HttpResponseException
     */
    public function upload(UploadedFile $file): array
    {
        $path = Filesystem::disk($this->getDriver())
            ->putFile($this->getPath(), $file, fn() => $this->generateFileName());

        if (!$path) {
            $this->throwHttpException('上传失败，请重试!');
        }

        $url = $this->getCloudDomain() . $path;
        $fileData = $this->getFileData($file);

        $result = File::create([
            'url' => $url,
            'path'=> $path,
            'user_id' => request()->uid(),
            ...$fileData
        ]);

        return [
            'id' => $result->id,
            'url' => $url,
            'name' => $file->getOriginalName(),
            'path' => $path
        ];
    }

    /**
     * 多文件上传
     *
     * @param array|UploadedFile $files
     * @return array
     * @throws \HttpResponseException
     */
    public function multiUpload($files): array
    {
        if (!is_array($files)) {
            return $this->upload($files);
        }

        return array_map(fn($file) => $this->upload($file), $files);
    }

    /**
     * 生成文件名
     */
    protected function generateFileName($length = 10)
    {
        $head = str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890');
        $filename = substr($head, mt_rand(0, 30), $length);
        return  date('y/m/d') . DIRECTORY_SEPARATOR . $filename;
    }


    /**
     * 获取上传目录
     */
    public function getPath(): string
    {
        $configPath = Config::get('filesystem.folder', '');
        return $configPath ?: $this->path;
    }

    /**
     * 设置上传目录
     */
    public function setPath(string $path): self
    {
        $this->path = rtrim($path, '/');
        return $this;
    }

    /**
     * 获取文件数据
     */
    protected function getFileData(UploadedFile $file): array
    {
        $mimeType = $file->getMime();
        return [
            'file_size' => $file->getSize(),
            'mime_type' => $mimeType,
            'file_ext' => $file->getOriginalExtension(),
            'filename' => $file->getOriginalName(),
        ];
    }


    /**
     * 验证上传文件
     * 
     * @throws HttpResponseException
     */
    public function checkFiles(): self
    {
        try {
            validate(['file' => config('system.upload.file')])->check(request()->file());
        } catch (ValidateException $e) {
            $this->throwHttpException($e->getError());
        }

        // SEC-011: 验证 MIME 类型与文件扩展名匹配
        $file = request()->file('file');
        $this->validateMimeType($file);

        return $this;
    }

    /**
     * 验证图片
     *
     * @throws HttpResponseException
     */
    public function checkImages(): self
    {
        try {
            validate(['file' => config('system.upload.image')])->check(request()->file());
        } catch (ValidateException $e) {
            $this->throwHttpException($e->getError());
        }

        // SEC-011: 验证 MIME 类型与文件扩展名匹配
        $file = request()->file('file');
        $this->validateMimeType($file);

        return $this;
    }

    /**
     * 验证附件
     *
     * @throws HttpResponseException
     */
    public function checkAttachment(): self
    {
        try {
            validate(['file' => config('system.upload.attachment')])->check(request()->file());
        } catch (ValidateException $e) {
            $this->throwHttpException($e->getError());
        }

        // SEC-011: 验证 MIME 类型与文件扩展名匹配
        $file = request()->file('file');
        $this->validateMimeType($file);

        return $this;
    }


    /**
     *  自定义验证上传文件
     * 
     * @param array| string  $validateRule 自定义验证规则
     * @return self
     * @throws HttpResponseException
     */
    public function validate(array | string $validateRule): self
    {
        $file = request()->file();

        if (!$validateRule) return $this;

        // 自定义规则验证
        try {
            validate(['file' => $validateRule])->check($file);
        } catch (ValidateException $e) {
            $this->throwHttpException($e->getError());
        }

        return $this;
    }


    /**
     * 获取云存储域名
     *
     * @throws \RuntimeException
     */
    public function getCloudDomain(): string
    {
        $driverConfig = config('filesystem.disks.' . $this->getDriver());

        return match ($driverConfig['type']) {
            'local' => $driverConfig['domain'],
            'qcloud' => $driverConfig['cdn'],
            'aliyun', 'qiniu' => $driverConfig['url'],
            default => throw new \RuntimeException("不支持的驱动类型: {$driverConfig['type']}")
        };
    }

    /**
     * 获取上传驱动
     */
    public function getDriver(): string
    {
        return $this->driver ?: config('filesystem.default');
    }

    /**
     * 设置上传驱动
     *
     * @throws \InvalidArgumentException
     */
    public function setDriver(string $driver): self
    {
        if (!array_key_exists($driver, self::DRIVERS)) {
            throw new \InvalidArgumentException(sprintf(
                '上传驱动 [%s] 不支持，可用驱动: %s',
                $driver,
                implode(', ', array_keys(self::DRIVERS))
            ));
        }

        $this->driver = $driver;
        return $this;
    }

    /**
     * 抛出HTTP异常
     *
     * @throws HttpResponseException
     */
    protected function throwHttpException(string $msg, int $code = 500): void
    {
        $response = Response::create([
            'code' => 0,
            'msg' => $msg
        ], 'json', $code);

        throw new HttpResponseException($response);
    }

    /**
     * SEC-011: 验证文件 MIME 类型与扩展名匹配
     * 防止伪造扩展名的恶意文件上传
     * 
     * @param UploadedFile $file
     * @return void
     * @throws HttpResponseException
     */
    protected function validateMimeType(UploadedFile $file): void
    {
        $ext = strtolower($file->getOriginalExtension());
        $mime = $file->getMime();

        // 常见文件扩展名与 MIME 类型映射表
        $mimeMap = [
            // 图片
            'jpg'  => ['image/jpeg'],
            'jpeg' => ['image/jpeg'],
            'png'  => ['image/png'],
            'gif'  => ['image/gif'],
            'webp' => ['image/webp'],
            // 文档
            'pdf'  => ['application/pdf'],
            'doc'  => ['application/msword'],
            'docx' => [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/zip',
            ],
            'xls'  => ['application/vnd.ms-excel'],
            'xlsx' => [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/zip',
            ],
            'ppt'  => ['application/vnd.ms-powerpoint'],
            'pptx' => [
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/zip',
            ],
            'txt'  => ['text/plain', 'application/octet-stream'],
            'csv'  => ['text/csv', 'text/plain', 'application/vnd.ms-excel'],
            // 音视频
            'mp4'  => ['video/mp4'],
            'mp3'  => ['audio/mpeg', 'audio/mp3'],
            'amr'  => ['audio/amr', 'application/octet-stream'],
        ];

        if (!isset($mimeMap[$ext])) {
            // 未知扩展类型，使用基础验证
            return;
        }

        if (!in_array($mime, $mimeMap[$ext])) {
            $this->throwHttpException('文件类型与扩展名不匹配，文件可能被篡改');
        }

        // 对于图片文件，额外验证文件头（防止图片马）
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            $imageInfo = getimagesize($file->getPathname());
            if ($imageInfo === false) {
                $this->throwHttpException('无效的图片文件，文件头验证失败');
            }
        }
    }
}
