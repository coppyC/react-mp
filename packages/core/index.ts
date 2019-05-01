import * as React from 'react'
import mount from './lifeCycle/mount';
import Updater from './Updater';


export default {
  render(Compoment: typeof React.Component, id = 'root') {
    let ThisUpdater !: typeof Updater
    Page({
      onLoad(query: any) {
        ThisUpdater = Updater.create(this)
        const root = mount(
          React.createElement(Compoment, query),
          id, ThisUpdater
        )
        this.setData!({ [id]: root })
      },
      onUnload() {
        ThisUpdater.ROOT!.unmount()
      }
    })
  }
}
