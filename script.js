let stockArray = ["FB", "AMZN", "GOOG", "AAPL", "MSFT"];

//this function is used to define the current stock
//we call another function to get the information from an API
function DefineStock(stockSymbol){
    //TODO: Esconder mi API key
    let stockURL = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + stockSymbol + "&interval=5min&outputsize=compact&apikey=8A2FATO31TXMHYZQ";
    let dailyURL = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol="+ stockSymbol +"&apikey=8A2FATO31TXMHYZQ";
    let yearlyURL = "https://www.alphavantage.co/query?function=OVERVIEW&symbol="+ stockSymbol +"&apikey=8A2FATO31TXMHYZQ";
    
    //Call the following function whenever I want to check the data for a Stock
    async function GetApi(url) { 
        const response = await fetch(url); 
        let data = await response.json();
        return data;
    }

    let GetHighLow = (highData, lowData) => {
        let high = highData.slice(0, highData.indexOf(".") + 3);
        let low = lowData.slice(0, lowData.indexOf(".") + 3);
        return [high, low];
    }

    async function GetStockValue(){
        let data = await GetApi(stockURL);
        let dailyData = await GetApi(dailyURL);
        let weeklyData = await GetApi(yearlyURL);

        let currentPrice;

        let highLowDaily = GetHighLow(dailyData["Global Quote"]["03. high"], dailyData["Global Quote"][ "04. low"]);
        let highLowWeekly = GetHighLow(weeklyData["52WeekHigh"], weeklyData["52WeekLow"]);

        for(x in data["Time Series (5min)"]){
            let latestPrice = data["Time Series (5min)"][x]["4. close"]; //Getting the most recent price
            currentPrice = latestPrice.slice(0, latestPrice.indexOf(".") + 3);
            break;
        }

        ElementUpdate([data["Meta Data"]["2. Symbol"], currentPrice, highLowDaily, highLowWeekly]);
    }

    GetStockValue();
}

//The following code gives every button on the upper left of the site an event listener 
let buttons = document.getElementsByClassName("classicStocks");
for(let i = 0; i<buttons.length;i++){
    buttons[i].addEventListener("click", function(){
        DefineStock(buttons[i].classList.item(1))
    }); 
}

function ProbabilityCalculation(price, possibleHigh, possibleLow){
   let probabilityToHigh = possibleLow <= 0? (price - 0.01) / (possibleHigh - 0.01) : (price - possibleLow) / (possibleHigh - possibleLow);
   let probabilityToLow = 1 - probabilityToHigh;
   return [probabilityToHigh, probabilityToLow];
}

function ElementUpdate(info){
    document.getElementById("stockHeading").innerHTML = info[0];

    document.getElementById("current").innerHTML = info[1];

    document.getElementById("24Max").innerHTML = info[2][0];
    document.getElementById("24Min").innerHTML = info[2][1];
    document.getElementById("yMax").innerHTML = info[3][0];
    document.getElementById("yMin").innerHTML = info[3][1];

    //TODO: tomar el input del usuario para lo siguiente
    //let probability =  ProbabilityCalculation(currentStockValue, 300, 250);
    //document.getElementById("maxPercentage").innerHTML = probability[0];
    //document.getElementById("minPercentage").innerHTML = probability[1];
}

function chart(){
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                borderWidth: 1, 
                fill: false,
                borderColor: 'rgba(102, 252, 241, 1)',
                lineTension: 0,
                pointBorderWidth: 0,
                pointRadius: 0
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    },

                    gridLines: {
                        color: 'rgba(0, 0, 0, 0)',
                        zeroLineColor: 'rgba(197, 198, 199, 1)',
                    }
                }],

                xAxes: [{
                    ticks: {
                        beginAtZero: false
                    },

                    gridLines: {
                        color: 'rgba(0, 0, 0, 0)',
                        zeroLineColor: 'rgba(197, 198, 199, 1)'
                    }
                }]
            },

            legend:{
                display: false
            }
        }
    });
}

chart();
//TODO: Quitar el comentario una vez que esté lista la grafica
DefineStock("FB");



/*
    TODO:
    Sprint 2 Grafica:
    -Hacer funcionar la grafica
    -Actualizar lineas de posibles precios en la grafica

    Sprint 3 Busqueda:
    -Hacer funcionar la barra de busqueda
    -Evitar errores al buscar una stock

    Sprint 4 Probabilidades:
    -Leer input de usuarios
    -Hacer funcionar el boton
    -Llamar funciones de algoritmos al presionar el boton
    -Actualizar numeros de probabilidaes

    Sprint 5 Optimizacion:
    -Actualizar la grafica cada 5 minutos o menos si es posible
    -Hacer la actualizacion de los datos automatica y deshacerce del boton
    -Crear autocopletado en la barra
    -Agregar probabilidad basada en el mas bajo de las ultimas horas y de el ultimo anio
*/