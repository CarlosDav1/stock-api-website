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

        //Changing the data inside the respective HTML element
        document.getElementById("stockHeading").innerHTML = data["Meta Data"]["2. Symbol"];
        for(x in data["Time Series (5min)"]){
            let latestPrice = data["Time Series (5min)"][x]["4. close"]; //Getting the most recent price
            let shortestPrice = latestPrice.slice(0, latestPrice.indexOf(".") + 3); //slicing the price so it only has 2 decimals
            document.getElementById("current").innerHTML = shortestPrice;
            break;
        }
    }

    async function HighAndLows(){
        let dailyData = await GetApi(dailyURL);
        let weeklyData = await GetApi(yearlyURL);

        let highLowDaily = GetHighLow(dailyData["Global Quote"]["03. high"], dailyData["Global Quote"][ "04. low"]);
        let highLowWeekly = GetHighLow(weeklyData["52WeekHigh"], weeklyData["52WeekLow"]);

        document.getElementById("24Max").innerHTML = highLowDaily[0];
        document.getElementById("24Min").innerHTML = highLowDaily[1];
        document.getElementById("yMax").innerHTML = highLowWeekly[0];
        document.getElementById("yMin").innerHTML = highLowWeekly[1];
    }
    
    GetStockValue();
    HighAndLows();

    //TODO: tomar el input del usuario para lo siguiente
    //let probability =  ProbabilityCalculation(currentStockValue, 300, 250);
    //document.getElementById("maxPercentage").innerHTML = probability[0];
    //document.getElementById("minPercentage").innerHTML = probability[1];
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

//TODO: Quitar el comentario una vez que esté lista la grafica
//DefineStock("FB");



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