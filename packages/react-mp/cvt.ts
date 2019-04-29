// TODO: 浏览器前缀
function style(cssProps: React.CSSProperties) {
  if(!cssProps) return ''
  if(typeof cssProps === 'string') return cssProps
  return Object.keys(cssProps).map(key => {
    const name = key.replace(/[A-Z]/g, x => '-' + x.toLowerCase())
    let value = cssProps[key]
    if(typeof value === 'number')
      value = value + 'rpx'
    return name + ':' + value
  }).join(';')
}

/** 忽略 布尔值、null 和 undefined */
function child(text: React.ReactText | null | undefined): string {
  if(typeof text === 'boolean' || text === null || text === undefined)
    return '' // 使用 空字符串，不使用 undefined，使 chil 节点均为 字符串 或 ReactElement 减少后面渲染难度
  return String(text) // 强转字符串，避免后面误用 !0
}

export default {
  style, child
}
