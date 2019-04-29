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

function child(text: React.ReactText) {
  if(!text || typeof text === 'boolean')
    return ''
  return text
}

export default {
  style, child
}
