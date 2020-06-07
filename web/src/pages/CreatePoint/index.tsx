import React, { useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft, FiCheckCircle} from 'react-icons/fi';
import {Map, TileLayer,Marker} from 'react-leaflet';
import axios from 'axios';

import {LeafletMouseEvent} from 'leaflet';
import api from '../../services/api';
import logo from '../../assets/logo.svg'

import ReactModal from 'react-modal';

import './styles.css'


interface Item {
    id : number;
    title : string;
    image_url : string;
}

interface IBGEUFResponse {
    sigla : string
}

interface IBGECityResponse {
    nome : string
}

const CreatePoint = () => {
    const [items,setItems] = useState<Item[]>([]);

    const [OpenModal,setOpenModal] = useState(false);
    const [ufs,setUfs] = useState<string[]>([]);
    const [cities,setCities] =  useState<string[]>([]);
    const [initialPosition, setInitialPosition]  = useState<[number,number]>([0,0]);
    const [selectedItems,SetSelectedItems] = useState<number[]>([]);

    const [formData,setFormData] = useState({
        name : '',
        email : '',
        whatsapp : ''
    })
    const [selectedUf,setSelectedUF] = useState('0');
    const [selectedCity,setSelectedCity]  = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0]);
    const history = useHistory();
    useEffect(() =>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude , longitude} = position.coords;
            setInitialPosition([latitude,longitude]);
            
        })
    },[])

    useEffect(() =>{
        api.get('items').then(response =>{
            setItems(response.data);
        })
    },[]);

    useEffect(() =>{
        axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados").then(response =>{
            const ufInitials = response.data.map(uf => uf.sigla);

            setUfs(ufInitials);
        })
    },[]);

    useEffect(() => {
        if(selectedUf === '0'){
            return;
        }
        axios
        .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(response =>{
            const citiesNames = response.data.map(city=> city.nome);
            setCities(citiesNames);
            
        });
    },[selectedUf]);

    function handleSelectUf(event : ChangeEvent<HTMLSelectElement>){
        const uf =event.target.value;

        setSelectedUF(uf);
        
    }
    function handleSelectCity(event : ChangeEvent<HTMLSelectElement>){
        const city =event.target.value;

        setSelectedCity(city);
        
    }

    function handleMapClick(event : LeafletMouseEvent){
        const {lat , lng} = event.latlng;
        setSelectedPosition([lat,lng]);
    }

    function handleInputChange(event : ChangeEvent<HTMLInputElement>){
        const {name,value} = event.target;
        setFormData({...formData,[name]:value});
    }

    function handleSelectItem(id : number){
        const alreadySelected = selectedItems.findIndex(item => item === id);
        if (alreadySelected >= 0)
        {
            const filteredItems = selectedItems.filter(item => item !== id);
            SetSelectedItems(filteredItems);
        }
        else {
            SetSelectedItems([...selectedItems,id]);
        }
       
    }
    async function handleSubmit(event : FormEvent){
        event.preventDefault();
        const { name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude,longitude] = selectedPosition;
        const items = selectedItems;
        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }
        await api.post('points',data);

        setOpenModal(true)
        setTimeout(() =>{
            history.push('/');
        },2000);
       
    }
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to='/'>
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name" >Nome da intidade</label>
                        <input 
                        type="text"
                        name="name"
                        id="name"
                        onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                    <div className="field">
                        <label htmlFor="email" >Email</label>
                        <input 
                        type="text"
                        name="email"
                        id="email"
                        onChange={handleInputChange}

                        />
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp" >Whatsapp</label>
                        <input 
                        type="text"
                        name="whatsapp"
                        id="whatsapp"
                        onChange={handleInputChange}

                        />
                    </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    
                    <Map setView={false} center={initialPosition} zoom={15} onClick={handleMapClick}> 
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={selectedPosition}>
          
        </Marker>
        
      </Map>
      
                   
                      

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                            name="uf" 
                            id="uf" 
                            value={selectedUf} 
                            onChange={handleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf =>(
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                            name="city" 
                            id="city" 
                            value={selectedCity} 
                            onChange={handleSelectCity}>
                                
                                <option value="0">Selecione uma Cidade</option>
                                { cities.map(city =>(
                                    <option key={city} value={city}>{city}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                       
                    
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                        <ul className="items-grid">
                            {items.map(item => (
                                <li key={item.id} onClick={() => handleSelectItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}
                                >
                                    
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                            ))}
                            
                            
                        </ul>
                </fieldset>


                <button type="submit" >
                    Cadastra ponto de coleta
                </button>
            </form>
            
            <ReactModal  style={{
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.25)'
    },
    content: {
      position: 'absolute',
      top: '40px',
      left: '40px',
      right: '40px',
      bottom: '40px',
      border: '1px solid #ccc',
      background: '#0E0A14',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      borderRadius: '4px',
      outline: 'none',
      padding: '20px',
      opacity: '0.90',
    justifyContent : 'center',
    display : 'flex',
    alignItems : 'center'
    }
  }}isOpen={OpenModal}>
                               <div className={"ReactModal__Content"}>
                               <FiCheckCircle color="green" size={64} style={{alignItems:"center",marginLeft:"100px"}}/>
                               <h1>Cadastro Concluido!</h1>
                               </div>
                               
            </ReactModal>
        </div>
    );
};

export default CreatePoint;