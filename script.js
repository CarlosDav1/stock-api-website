let stockArray = ["FB", "AMZN", "GOOG", "AAPL", "MSFT"];
const calculateButton = document.getElementById("bigButton");
const maxPriceField = document.getElementById("maxPrice");
const minPriceField = document.getElementById("minPrice");

maxPriceField.addEventListener("change", function(){myChart(true, maxPriceField.value)});
minPriceField.addEventListener("change", function(){myChart(false, minPriceField.value)});

let buttons = document.getElementsByClassName("classicStocks");
for(let i = 0; i<buttons.length;i++){
    buttons[i].addEventListener("click", function(){
        DefineStock(buttons[i].classList.item(1))
    }); 
}

//this function is used to define the current stock
//we call another function to get the information from an API
function DefineStock(stockSymbol){
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
        let chartData = [];

        let highLowDaily = GetHighLow(dailyData["Global Quote"]["03. high"], dailyData["Global Quote"][ "04. low"]);
        let highLowWeekly = GetHighLow(weeklyData["52WeekHigh"], weeklyData["52WeekLow"]);

        for(x in data["Time Series (5min)"]){
            let latestPrice = data["Time Series (5min)"][x]["4. close"]; //Getting the most recent price
            currentPrice = latestPrice.slice(0, latestPrice.indexOf(".") + 3);
            break;
        }

        for(y in data["Time Series (5min)"]){
            let prices = data["Time Series (5min)"][y]["4. close"];
            chartData.push(prices);
        }

        function initialValues(price){
            const maxEstimate = maxPriceField.value = parseFloat(price) + 1;
            const minEstimate = minPriceField.value = parseFloat(price) - 1;
            return [minEstimate, maxEstimate];
        }
        
        let chartLastRefreshed = [data["Meta Data"]["3. Last Refreshed"], data["Meta Data"]["6. Time Zone"]];

        ElementUpdate([data["Meta Data"]["2. Symbol"], currentPrice, highLowDaily, highLowWeekly, chartData, initialValues(currentPrice), chartLastRefreshed]);
    }

    GetStockValue();
}

function chart(pricesArray, min, max){
    let priceHistory = pricesArray.map(item => item);
    
    var ctx = document.getElementById('myChart').getContext('2d');
    var chartInfo = new Chart(ctx, {
    type: 'line',
    data: {
        labels: priceHistory,
        datasets: [{
            label: 'price',
            data: priceHistory,
            borderWidth: 1, 
            fill: false,
            borderColor: 'rgba(102, 252, 241, 1)',
            lineTension: 0,
            pointBorderWidth: 0,
            pointRadius: 0,
            pointHitRadius: 0
        },
        {
            label: 'max',
            data: priceHistory.map(() => value = max),
            borderWidth: 1, 
            fill: false,
            borderColor:  'rgba(107, 252, 102, 1)',
            lineTension: 0,
            pointBorderWidth: 0,
            pointRadius: 0,
            pointHitRadius: 0
        },
        {
            label: 'min',
            data: priceHistory.map(() => value = min),
            borderWidth: 1, 
            fill: false,
            borderColor: 'rgba(252, 102, 110, 1)',
            lineTension: 0,
            pointBorderWidth: 0,
            pointRadius: 0,
            pointHitRadius: 0
        }
    ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: false
                },

                gridLines: {
                    color: 'rgba(0, 0, 0, 0)',
                    zeroLineColor: 'rgba(197, 198, 199, 1)'
                }
            }],

            xAxes: [{
                ticks: {
                    beginAtZero: true,
                    display: false
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
    }
);

    function modifyChart(param, newValue)
    {
        if (param && newValue > priceHistory[priceHistory.length - 1]){
            chartInfo.data.datasets[1].data = priceHistory.map(() => value = parseFloat(newValue));
            ProbabilityCalculation(priceHistory[priceHistory.length - 1], newValue, chartInfo.data.datasets[2].data[0]);
        }
        else if (!param && newValue < priceHistory[priceHistory.length - 1]){
            chartInfo.data.datasets[2].data = priceHistory.map(() => value = parseFloat(newValue));
            ProbabilityCalculation(priceHistory[priceHistory.length - 1], chartInfo.data.datasets[1].data[0], newValue);
        }
        else if (param && newValue < priceHistory[priceHistory.length - 1]){
            alert("The Max. price has to be bigger than the current price");
        }
        else{
            alert("The Min. price has to be smaller than the current price");
        }

        chartInfo.update();
    }

    return modifyChart;
}

function ProbabilityCalculation(price, possibleHigh, possibleLow){
    let probabilityToHigh = possibleLow <= 0? (price - 0.01) / (possibleHigh - 0.01) : (price - possibleLow) / (possibleHigh - possibleLow);
    let probabilityToLow = 1 - probabilityToHigh;
    let high, low;

    if(probabilityToHigh >= 0.989){
        probabilityToHigh = 0.99;
        probabilityToLow = 0.01;
    }
    else if(probabilityToLow >= 0.989){
        probabilityToLow = 0.99;
        probabilityToHigh = 0.01;
    }

    probabilityToHigh = (probabilityToHigh * 100).toString();
    probabilityToLow = (probabilityToLow * 100).toString();

    if(probabilityToHigh.indexOf(".") == -1 || probabilityToLow.indexOf(".") == -1){
        high =  probabilityToHigh + "%";
        low = probabilityToLow + "%";
    }
    else{
        high =  probabilityToHigh.slice(0, probabilityToHigh.indexOf(".")) + "%";
        low = probabilityToLow.slice(0, probabilityToLow.indexOf(".")) + "%";
    }

    document.getElementById("maxPercentage").innerHTML = high;
    document.getElementById("minPercentage").innerHTML = low;
}

function ElementUpdate(info){
    document.getElementById("stockHeading").innerHTML = info[0];

    document.getElementById("current").innerHTML = info[1];

    document.getElementById("24Max").innerHTML = info[2][0];
    document.getElementById("24Min").innerHTML = info[2][1];
    document.getElementById("yMax").innerHTML = info[3][0];
    document.getElementById("yMin").innerHTML = info[3][1];

    document.getElementById("chartDisclaimer").innerHTML = "Last refreshed: " + info[6][0] + " " + info[6][1] ;

    info[4].reverse();

    myChart = chart(info[4], info[5][0], info[5][1]);

    ProbabilityCalculation(info[1], info[5][0], info[5][1]);
}

DefineStock("FB");

/*
    TODO:
    Sprint 5 Optimizacion:
    -hacer esto responsivo
    -Agregar un last refreshed para aclarar confusiones asi como un 5 minute chart indicator
*/