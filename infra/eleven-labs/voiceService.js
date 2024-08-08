const { default: axios } = require("axios");
const FormData = require('form-data');
const fetch = require("node-fetch");

require('dotenv/config');

const BASE_URL = 'https://api.elevenlabs.io';
const API_KEY = process.env.ELEVEN_LABS_API_KEY;

const voices = [
  {
    id: 'duwvg00mLTTW9EDdCivB',
    name: 'Rick Sanchez',
    language: 'pt-BR',
  },
  {
    id: '2IOB6mI7IENAbNQurvCQ',
    name: 'Manoel Gomes',
    language: 'pt-BR',
  },
  {
    id: 'FalnBjOnCkjQT1lIuDx5',
    name: 'Bolsonaro',
    language: 'pt-BR',
  }
];

const getVoices = async () => {
  // const url = '/v1/voices?show_legacy=true';

  // const { data } = await request({}, 'GET', url);

  // console.log(data);
  // return data;
};

const textToSpeech = async (voiceId, text) => {
  const body = {
    text: text,
    voice: voiceId,
    language: 'pt-BR'
  }

  const url = `/v1/text-to-speech/${voiceId}`;

  const { data } = await post(url, body, 'arraybuffer');
  return data;
}

const speechToSpeech = async (voiceId, urlFile) => {
  const form = new FormData();
  const response = await fetch(urlFile);

  const buffer = await response.buffer();
  console.log('Buffer length:', buffer.length);

  form.append('audio', buffer, { filename: 'yourfile.mp3' });

  form.append('voice', voiceId);
  form.append('language', 'pt-BR');

  const url = `/v1/speech-to-speech/${voiceId}`;

  const { data } = await post(url, form, 'arraybuffer', 'multipart/form-data');
  return data;
}

const post = async (url, body, responseType = 'json', contentType = 'application/json') => {
  const header = {
    'Content-Type': contentType,
    'xi-api-key': API_KEY,
  }

  const options = {
    responseType,
    headers: header,
  }

  return axios.post(`${BASE_URL}${url}`, body, options );
}

module.exports = {
  textToSpeech,
  speechToSpeech,
  voices,
}