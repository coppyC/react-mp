/** 从 crrent `cd` dir, 只支持一级目录 */
export function goto(current: string, dir: string) {
  dir = dir.replace(/^\.\.\//, () => {
    current = current.replace(/(^|\.)[^.]+$/, '')
    return ''
  })

  return !dir
    ? current
    : current
    ? current + '.' + dir
    : dir
}
