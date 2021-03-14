import { isObject } from "@vue/shared"
import {
    mutableHandlers,
    shallowReactiveHandlers,
    readonlyHandlers,
    shallowReadonlyHandlers
} from './baseHandlers'

/**
 * @method reactive 深度监听
*/
export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers)
}

/**
 * @method shallowReactive 只监听第一层
*/
export function shallowReactive(target) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

/**
 * @method readonly 只读
*/
export function readonly(target) {
  return createReactiveObject(target, true, readonlyHandlers)
}

/**
 * @method shallowReadonly 第一层只读
*/
export function shallowReadonly(target) {
  return createReactiveObject(target, true, shallowReadonlyHandlers)
}

// WeakMap 会自动垃圾回收，不会造成内存泄露，存储的key只能是对象
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()

export function createReactiveObject(target, isReadonly, baseHandlers) {
  // 如果目标不是对象 没法拦截了，reactivity这个api只能拦截对象类型
  if (!isObject(target)) {
    return target
  }
  // 如果某个对象已经被代理过了，就不要再次代理了
  // 可能一个对象被代理是深度 又被只读代理了
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const exisitProxy = proxyMap.get(target)
  // 如果已经被代理过了，直接返回即可
  if (exisitProxy) {
    return exisitProxy
  }
  const proxy = new Proxy(target, baseHandlers)
  // 将要代理的对象和对应代理的结果缓存起来
  proxyMap.set(target, proxy)
  return proxy
}
