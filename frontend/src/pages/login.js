import React from 'react';
import { Link } from 'react-router-dom';
 function LoginPage (){
    return(
        <div>
            <Link to= "/admin"><button> Admin </button></Link>
            <Link to= "/facLandingPage/branch"><button> Faculty </button></Link>
           `<Link to="/student/66c7b102968914572e261fca/dashboard"><button> Student </button> </Link>
            BEWARE: CSS ISSUES COMING UP
        </div>
    );
 }
 export default  LoginPage;