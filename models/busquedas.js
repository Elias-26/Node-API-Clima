const fs = require('fs');

const axios = require('axios');

class Busquedas {

    historial = [];
    dbpath = './db/database.json';

    constructor() {
        //TODO: leer DB si existe 
        this.leerDB();

    }

    get historialCapatilizado() {
        return this.historial.map(lugar => {

            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ')
        })
    }

    get paramsMapbox() {
        return {
            'limit': 6,
            'language': 'es',
            'access_token': process.env.MAPBOX_KEY,


        }
    }
    get paramsWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'

        }
    }

    async ciudad(lugar = '') {

        try {
            //peticion http 
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox

            });


            //const resp = await axios.get('?proximity=ip&types=place%2Cpostcode%2Caddress&language=es%2Cen&access_token=pk.eyJ1IjoiZWxpYXNyZXluYWdhIiwiYSI6ImNsMWN2em52MTAydnkzZXBtZW1la212YWgifQ.6kgkfjDDZSywW4eYKVtJxQ`')
            const resp = await instance.get();
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            })); //es de donde se extraera la informacion. 


        } catch (error) {
            //console.log('no se encontro el dato ingresado, intenta de nuevo...'.red)
            return [];
        }

    }
    async climaLugar(lat, lon) {

        try {

            const instance = axios.create({
                baseURL: 'https://api.openweathermap.org/data/2.5/weather?',
                params: { ...this.paramsWeather, lat, lon }

            })

            const resp = await instance.get();
            const { weather, main } = resp.data;


            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }
    }



    agregarHistorial(lugar = '') {


        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }
        this.historial = this.historial.splice(0,5);
        //TODO:prevenir los duplicados}
        this.historial.unshift(lugar.toLocaleLowerCase());


        //grabar en DB
        this.grardarDB();
    }


    grardarDB() {
        const payload = {
            historial: this.historial
        };
        fs.writeFileSync(this.dbpath, JSON.stringify(payload));

    }

    leerDB() {
        if (!fs.existsSync(this.dbpath)) return;
        const info = fs.readFileSync(this.dbpath, { encoding: 'utf-8' });
        const data = JSON.parse(info);

        this.historial = data.historial;

    }
}




module.exports = Busquedas;
