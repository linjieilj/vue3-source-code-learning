import { isIntegerKey } from "@vue/shared"
import { isArray } from "@vue/shared"
import { TriggerOrTypes } from "./operators"

// 响应式effect,数据变化重新执行
export function effect(fn, options: any = {}) {
  const effect: any = createReactiveEffect(fn, options)

  // 默认的effect会先执行
  if (!options.lazy) {
    effect()
  }

  return effect
}

let uid = 0
let activeEffect
const effectStack = []
const createReactiveEffect = (fn, options) => {
  const effect = function reactiveEffect() {
    // 保证effect没有加入到effectStack中，避免死循环
    /*effect(() => {
        state.count++
      })*/
    if (effectStack.includes(effect)) return
    try {
      // 把effect存入栈中, 避免嵌套effect时导致effect搜集混乱
      /* effect(() => {
        state.age //effect1
        effect(() => {
          state.name //effect2
        })
        state.xxx //effect2 实际应该是effect1
      })*/
      effectStack.push(effect)
      // 存储当前的effect
      activeEffect = effect
      // 执行函数时会取值触发get方法
      return fn()
    } finally {
      // 执行完毕后，当前的effect出栈
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
    }
  }
  // 添加effect标识，用于区分effect
  effect.uid = uid++
  // 用于标识这个是响应式effect
  effect._idEffect = true
  // 在effect上保存对应的原函数和属性
  effect.raw = fn
  effect.options = options

  return effect
}

// 搜集某个对象中的属性对应的effect函数 key => {name: 'jay', age: 29} value (map) => {name => set}
const targetMap = new WeakMap()
/**
 * @method track 让某个对象中的属性，搜集当前它对应的effect函数
*/
export function track(target, type, key) {
  console.log(target, key, activeEffect)
  // 如果没有activeEffect，说明此属性没在effect中，无需搜集
  if (activeEffect === undefined) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
  console.log(depsMap)
}

/**
 * @method trigger 找属性对应的effect, 让其执行 (数组、对象)
*/
export function trigger(target, type, key?, newValue?, oldValue?) {
  // 如果这个属性没有收集过effect，那不需要做任何操作
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  // 对effect去重
  const effects = new Set()
  const add = effectsToAdd => {
    if (!effectsToAdd) return
    effectsToAdd.forEach(effect => effects.add(effect))
  }
  // 将所有要执行的effect全部存到一个新的集合中，最终一起执行
  // 修改的是不是数组长度，因为改长度影响比较
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, depKey) => {
      console.log(depsMap, dep, depKey)
      // 更改的length长度小于收集的索引，那么收集的索引需要触发更新
      if (depKey === 'length' || depKey > newValue) {
        add(dep)
      }
    })
  } else {
    // 对象修改
    if (key !== undefined) {
      add(depsMap.get(key))
    }
    // 如果修改数组中的某一个索引, 如a = [1, 2, 3]  a[100] = 1
    switch(type) {
      case TriggerOrTypes.ADD:
        // 如果添加了一个索引就触发长度的更新
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get('length'))
        }
    }
  }
  effects.forEach((effect: any) => effect())
}