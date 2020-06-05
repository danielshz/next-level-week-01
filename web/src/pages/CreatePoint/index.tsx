import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';

import Dropzone from '../../components/Dropzone';
import { LeafletMouseEvent } from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';

import './styles.css';
import logo from '../../assets/logo.svg';

import { FiArrowLeft } from 'react-icons/fi';

import axios from 'axios';
import api from '../../services/api';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedUf, setSelectedUf] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const history = useHistory();

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });

    axios
      .get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => setUfs(response.data.map(uf => uf.sigla)));

    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setSelectedPosition([latitude, longitude]);
    })
  }, []);

  const handleSelectedUf = (event: ChangeEvent<HTMLSelectElement>) => {
    const uf = event.target.value;

    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(response => setCities(response.data.map(city => city.nome)));

    setSelectedUf(uf);
  };

  const handleMapClick = (event: LeafletMouseEvent) => {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ]);
  };
  
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleSelectItem = (id: number) => {
    if(selectedItems.includes(id))
      setSelectedItems(selectedItems.filter(itemId => itemId !== id ));
    else
      setSelectedItems([ ...selectedItems, id ]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    
    if(selectedFile)
      data.append('image', selectedFile);
    
    await api.post('points', data);

    history.push('/');
  };

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1> Cadastro do <br/> ponto de coleta </h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>  
            <h2> Dados </h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="text"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="name">Whatsapp</label>
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
            <h2> Endereço </h2>
            <span> Selecione o endereço no mapa </span>
          </legend>

          <Map 
            center={[-22.9131323, -43.242477]} 
            zoom={15}
            onClick={handleMapClick}
          > 
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf"> Estado (UF) </label>

              <select 
                name="uf" 
                id="uf"
                onChange={handleSelectedUf}
              >
                <option value="0">Selecione uma UF</option>

                { ufs.map(uf => 
                  <option value={uf} key={uf}>{uf}</option>
                )}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city"> Cidade </label>

              <select 
                name="city" 
                id="city"
                onChange={(event) => setSelectedCity(event.target.value)}
              >
                <option value="0">Selecione uma Cidade</option>

                { cities.map(city => 
                  <option value={city} key={city}>{city}</option>
                )}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>  
            <h2> Ítens de coleta </h2>
            <span> Selecione um ou mais ítens abaixo </span>
          </legend>

          <ul className="items-grid">
            { items.map(item => (
              <li 
                key={item.id} 
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt="TESTE"/>
                <span> {item.title} </span>
              </li>
            ))}    
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
}

export default CreatePoint;