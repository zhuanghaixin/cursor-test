def bubble_sort(arr: list) -> list:
    """
    冒泡排序算法
    参数:
        arr: 需要排序的列表
    返回:
        排序后的列表
    """
    n = len(arr)
    # 遍历所有数组元素
    for i in range(n):
        # 添加一个标志来检查是否有交换
        swapped = False 
        # Last i elements are already in place
        for j in range(0, n-i-1):
            # 从头到尾遍历数组，比较相邻元素
            if arr[j] > arr[j+1]:
                # 如果当前元素大于下一个元素，则交换它们
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True
        
        # 如果内循环中没有发生交换，说明数组已经排序完成
        if not swapped:
            break
            
    return arr

# 测试代码
if __name__ == "__main__":
    # 测试数组1
    test_array = [12, 45, 66, 44, 34, 45]
    print("测试数组1排序前:")
    print(test_array)
    
    sorted_array = bubble_sort(test_array.copy())  # 使用copy()避免修改原数组
    print("测试数组1排序后:")
    print(sorted_array)
    
    # 测试数组2
    test_array2 = [64, 34, 25, 12, 22, 11, 90]
    print("\n测试数组2排序前:")
    print(test_array2)
    
    sorted_array2 = bubble_sort(test_array2.copy())
    print("测试数组2排序后:")
    print(sorted_array2)