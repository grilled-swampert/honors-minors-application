import React from 'react';
import './facView.css';
import Header from "../../header/header";
import FacViewRightprt from "./components/fac-view-rightprt.js"

function FacView() {
    return (
      <div className='fac-view-main'>
        <Header />
        <FacViewRightprt />
      </div>
      
      );
      }

    export default FacView;