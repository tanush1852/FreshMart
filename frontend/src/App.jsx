import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import AuthPage from './screens/AuthPage'
import './index.css'
import HomeStore from './screens/HomeStore';
import CustomerHomepage from './screens/HomeCust';
import OrderPage from './screens/OrderPage';
function App() {


  return (
    <>
    {/* <Button>Click me!!</Button> */}
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage/>} />
        <Route path="/homestore" element={<HomeStore/>}/>
        <Route path="/homecust" element={<CustomerHomepage/>}/>
        <Route path="/orders"  element={<OrderPage/>}/> 
        

      </Routes>
    </Router>
    </>
  )
}

export default App
