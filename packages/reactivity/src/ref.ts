import { isArray, isObject } from "@vue/shared"
import { hasChange } from "@vue/shared"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOrTypes } from "./operators"
import { reactive } from "./reactive"

//这步内部就是转化为Object.defineProperty
// var RefImpl = /*#__PURE__*/function () {
//   function RefImpl() {}

//   Object.defineProperty(RefImpl, [{
//     key: "value",
//     get: function get() {},
//     set: function set(newVal) {}
//   }]);

//   return RefImpl;
// }();
const convert = (val) => isObject(val) ? reactive(val) : val
class RefImpl {
  // 表示声明了一个_value属性，但是没有赋值
  public _value
  // 产生的实例会被添加__v_isRef，表示是一个ref属性
  public __v_isRef = true
  // 参数前面增加修饰符 标识此属性放到实例上，可以直接使用
  constructor(public rawValue, public shallow) {
    // 如果是深度监听，需要把里面的都变成响应式
    this._value = shallow ? rawValue : convert(rawValue)
  }
  // 类的属性访问器
  get value() {
    track(this, TrackOpTypes.GET, 'value')
    return this._value
  }

  set value(newValue) {
    // 判断老值和新值是否有变化
    if (hasChange(newValue, this.rawValue)) {
      this.rawValue = newValue
      this._value = this.shallow ? newValue : convert(newValue)
      trigger(this, TriggerOrTypes.SET, 'value', newValue)
    }
  }
}

function createRef(rawValue, shallow = false) {
  return new RefImpl(rawValue, shallow)
}

export function ref(value) {
  // 将普通类型 变成一个对象， 可以是对象，但是一般情况下对象直接用reactive更合理
  return createRef(value)
}

// 可以把一个对象的值转成ref类型
class ObjectRefImpl {
  public __v_isRef = true
  constructor(public target, public key) {

  }
  get value() {
    // 如果原对象是响应式的就会依赖收集
    return this.target[this.key]
  }

  set value(newValue) {
    // 如果原来对象是响应式的，那么就会触发更新
    this.target[this.key] = newValue
  }
}

// 将对象上某一个key对应的值 转化成ref类型
export function toRef(target, key) {
  return new ObjectRefImpl(target, key)
}

// 将对象上key对应的值 转化成ref类型---响应式解构
export function toRefs(object) {
  const ret = isArray(object) ? new Array(object.length) : {}
  for (let key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}

// ref 和 reactive的区别，reactive内部采用proxy  ref中内部使用的是defineProperty

export function shallowRef(value) {
  // 将普通类型 变成一个对象
  return createRef(value, true)
}

// vue源码基本都是高阶函数，做了类似柯里化的功能