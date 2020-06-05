import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import RNPickerSelect, { Item, PickerStyle } from 'react-native-picker-select';

import axios from 'axios';

import { useNavigation } from '@react-navigation/native';

import { Feather as Icon } from '@expo/vector-icons';

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const Home: React.FC = () => {
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => setUfs(response.data.map(uf => uf.sigla)));

  }, []);

  const handleNavigateToPoints = () => {
    navigation.navigate('Points', {
      uf: selectedUf,
      city: selectedCity
    });
  };

  const handleSelectedUf = (uf: string) => {
    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(response => setCities(response.data.map(city => city.nome)));

    setSelectedCity('');

    setSelectedUf(uf);
  };

  return (
      <ImageBackground 
        source={require('../../assets/home-background.png')} 
        style={styles.container}
        imageStyle={{ width: 274, height: 368 }} 
      >
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu marketplace de coleta de resíduos </Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <RNPickerSelect 
            style={styles.input as PickerStyle}
            placeholder={{ label: 'Selecione a UF', value: 0 }}
            onValueChange={handleSelectedUf}
            items={ufs.map(uf => ({ 
              label: uf, 
              value: uf, 
            }) as Item )}
          />

          <RNPickerSelect 
            style={styles.input as PickerStyle}
            placeholder={{ label: 'Selecione a Cidade', value: 0 }}
            disabled={cities.length === 0}
            onValueChange={city => setSelectedCity(city)}
            items={cities.map(city => ({ 
              label: city, 
              value: city, 
            }) as Item )}
          />

          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Icon name="arrow-right" color="#FFF" size={24} />
            </View>
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </RectButton>
        </View>

      </ImageBackground>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});