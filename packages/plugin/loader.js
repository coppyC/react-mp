
/**
 * 获取 source 中一个没有用过的变量名
 * @param {string} source
 * @param {string} name
 */
function getUniRootName(source, name) {
  if(source.includes(name))
    return getUniRootName('_' + source, name + '_')
  return name
}

const EXP_DEF_REG = () => /(^|\n)\s*export\s+default\s/

/**
 * @param {string} source
 */
module.exports = function(source) {
  const ROOT_NAME = getUniRootName(source, 'ROOT')
  const REACT_MP_NAME = getUniRootName(source, 'ReactMp')
  if(!EXP_DEF_REG().test(source)) {
    console.error('⚠️   \033[40;33m ' + this.resourcePath + '\033[0m')
    console.log('没有使用 export default 导出页面组件')
    console.log('------------------------------\n')
    return source
  }
  source = `
    import ${REACT_MP_NAME} from 'react-mp'
    ${source.replace(EXP_DEF_REG(), `\nconst ${ROOT_NAME} = `)}
    ${REACT_MP_NAME}.render(${ROOT_NAME}, 'root')
  `
  return source
}
