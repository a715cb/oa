import type { SetupContext } from "vue";
import type { UseTableFromState } from "./useQueryFilterState";

type UseTableFormMethodsParams = {
  slots: SetupContext["slots"];
  state: UseTableFromState;
};

export function useTableFormMethods({ slots: _slots, state: _state }: UseTableFormMethodsParams) {
  // 初始化查询筛选方法
  void _slots;
  void _state;
}
