import React from 'react';
import './fac-add-bottom.css';

function FacAddBottom({ term }){
    return(
          <div className="add-bottom">
              <div className="add-box">
                    <p>CSV: {term.students}</p>
              </div>
          </div>
    );
}
export default FacAddBottom;