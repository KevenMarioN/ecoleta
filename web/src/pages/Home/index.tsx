import React from 'react';
import {FiLogIn,FiSearch} from 'react-icons/fi';
import {Link} from 'react-router-dom';


import './styles.css';

import logo from '../../assets/logo.svg';

const Home = () => {
    return(
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="Ecoleta"/>
                    <Link to='/create-point' style={{width: "247px",marginLeft:"500px",height: "56px"}}>
                    <FiLogIn size={24}/>
                    Cadastre um ponto de coleta
                </Link>
                </header>
                <main>
                    <h1>Seu marketplace de coleta de resíduos.</h1>
                    <p>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</p>
                    <Link to="/">
                        <span>
                        <FiSearch/>
                        </span>
                        <strong>Pesquisa ponto de coleta</strong>
                    </Link>
                </main>
            </div>
        </div>
    );
}

export default Home;