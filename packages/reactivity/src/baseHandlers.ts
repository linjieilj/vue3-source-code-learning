// 实现 new Proxy(target, handler)

import { extend, hasChange, hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOrTypes } from "./operators"
import { reactive, readonly } from "./reactive"

function createGetter(isReadonly = false, isShallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)

    if (!isReadonly) {
      // 搜集依赖，等待数据变化后更新对应的视图
      console.log('依赖搜集')
      track(target, TrackOpTypes.GET, key)
    }

    if (isShallow) {
      return res
    }

    // vue2 一上来就递归，vue3 是当取值时会进行代理
    // vue3的代理模式是懒代理
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

function createSetter(isShallow = false) {
  return function set(target, key, value, receiver) {
    // 获取旧的值
    const oldValue = target[key]

    // 判断是否存在key
    let hasKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)

    const res = Reflect.set(target, key, value, receiver)

    // 区分是新增还是修改
    // 当数据更新时， 通知对应属性的effect重新执行

    if (!hasKey) {
      // 新增
      trigger(target, TriggerOrTypes.ADD, key, value)
    } else if (hasChange(oldValue, value)) {
      // 修改
      trigger(target, TriggerOrTypes.ADD, key, value, oldValue)
    }

    return res
  }
}

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

const set = createSetter()
const shallowSet = createSetter(true)

const readonlyObj = {
  set: (target, key) => {
    console.warn(`set on key ${key} failed`)
  }
}

export const mutableHandlers = {
  get,
  set
}

export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet
}

export const readonlyHandlers = extend({
  get: readonlyGet,
}, readonlyObj)

export const shallowReadonlyHandlers = extend({
  get: shallowReadonlyGet
}, readonlyObj)