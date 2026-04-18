import { useMessage } from "./useMessage";
import type { ModalOptionsEx } from "./useMessage";

/**
 * 确认对话框配置接口
 */
export interface ConfirmActionConfig {
  /** 对话框标题 */
  title: string;
  /** 对话框内容 */
  content?: string;
  /** 图标类型 */
  iconType?: "warning" | "success" | "error" | "info";
  /** 确认按钮文字 */
  okText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认按钮类型 */
  okType?: "primary" | "danger";
  /** 要执行的操作函数（返回 Promise） */
  action: () => Promise<any>;
  /** 操作成功后的提示消息 */
  successMsg?: string;
  /** 操作成功后的回调 */
  onSuccess?: () => void;
  /** 操作失败后的回调 */
  onError?: (error: any) => void;
}

/**
 * 可复用的确认对话框 Hook
 * 用于替换重复的 createConfirm 调用模式
 *
 * @example
 * ```ts
 * const handleDelete = useConfirmAction({
 *   title: "确认要删除该用户吗?",
 *   content: "此操作不可恢复",
 *   iconType: "warning",
 *   action: () => destroy(id),
 *   successMsg: "删除成功",
 *   onSuccess: () => search()
 * });
 *
 * // 在模板中使用
 * <a-button @click="handleDelete">删除</a-button>
 * ```
 */
export function useConfirmAction(config: ConfirmActionConfig) {
  const { message } = useMessage();

  /**
   * 执行确认操作
   */
  const { createConfirm } = useMessage();

  const execute = () => {
    const {
      title,
      content,
      iconType = "warning",
      okText = "确定",
      cancelText = "取消",
      okType,
      action,
      successMsg,
      onSuccess,
      onError
    } = config;

    const confirmOptions: ModalOptionsEx = {
      title,
      content: content || "",
      iconType,
      okText,
      cancelText,
      onOk: async () => {
        try {
          const res = await action();
          if (res.code === 1) {
            if (successMsg) {
              message.success(successMsg);
            }
            onSuccess?.();
          } else {
            message.error(res.msg || "操作失败");
          }
        } catch (error) {
          onError?.(error);
        }
      }
    };

    if (okType === "danger") {
      confirmOptions.okButtonProps = { danger: true };
    }

    return createConfirm(confirmOptions);
  };

  return execute;
}
