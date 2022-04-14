require('dotenv').config()

require('colors');
const { inquirerMenu, pausa, leerInput, listarLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');


console.clear();

const main = async () => {

    const busquedas = new Busquedas();
    let opt;
  
    do {
        opt = await inquirerMenu();

        switch (opt) {

            case 1:
                //mostrar mensaje
                const termino = await leerInput('Ciudad: ');

                //buscar los lugares
                const lugares = await busquedas.ciudad(termino);

                //seleccionar el lugar
                const id = await listarLugares(lugares);
                if (id === '0') continue;

                const lugarSel = lugares.find(l => l.id === id);
                //console.log(lugarSel);

                //grardar en DB
                busquedas.agregarHistorial( lugarSel.nombre );

                //clima (datos)
                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);


                //Mostrar los resultados
                console.clear();// este clear es para que el menu se borre y se muestre la busqueda de una forma mas limpia en la pantalla. 
                console.log('\nInformaccion de la ciuda\n'.green);
                console.log('Ciudad:', lugarSel.nombre.red);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Temperatura:', clima.temp);
                console.log('Minima:', clima.min);
                console.log('Maxima:', clima.max);
                console.log('Como está el clima:', clima.desc.blue);

                break;



            case 2:
                busquedas.historialCapatilizado.forEach( (lugar, i) => {
                    const idx = `${ i + 1 }.`.green;
                    console.log( `${ idx } ${ lugar }` );
                })


                break;



        }
        //console.log({ opt })  <este concole muestra en la consola la opcion seleccionada, pero no es necesaria cuando ya tienes que presentar tu trabajo.>

        if(opt !== 0 ) await pausa();

    } while (opt !== 0)



}


main();