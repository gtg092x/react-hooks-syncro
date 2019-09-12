import React from 'react'
import { SyncProvider } from '../../../lib'
import Routes from './Routes'

const App = ({ extras }) => {
  return (
    <SyncProvider extras={extras}>
      <Routes />
    </SyncProvider>
  )
}

export default App;
