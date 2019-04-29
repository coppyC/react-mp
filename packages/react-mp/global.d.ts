interface ReactElement extends React.ReactElement {
  $$typeof: Symbol
  type: string | React.SFC | (typeof React.Component)
  ref: any
  props: {
    children?: React.ReactNode
    [prop: string]: any
  }
}

interface Instances {
  [path: string]: {
    owner: React.Component
    tree: React.ReactNode
  }
}
