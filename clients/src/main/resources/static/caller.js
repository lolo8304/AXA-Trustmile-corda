
function GETvar(parameterName) {
    var result = null,
    tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    });
    return result;
}

var port = GETvar("port");
var local = GETvar("local");
var test = GETvar("test");
MAIN_URL="";
if (port != null) {
    if (local != null) {
        MAIN_URL = "http://localhost:"+port
    } else {
        MAIN_URL = document.location.protocol + "//" + document.location.hostname + ":" + port
    }
   if (test != null) {
        MAIN_URL="//65.52.142.219:"+port;
   }
}

ME_MILEAGE=-1000
ME_CAR_EVENT={}
ME_PRICE=0
ME_EST_PRICE=0

function intToAmount(amount)
{
    const locale = 'de-CH';
    const options = { style: 'currency', currency: 'CHF' };
    return Intl.NumberFormat(locale, options).format(amount);
}

function intFormat(amount) {
    const locale = 'de-CH';
    return Intl.NumberFormat(locale).format(amount);

}

function X500toO(x500) {
    if (x500 == null || x500 == "") return "";
    var DNs = x500.split(/[,=]/)
    return DNs[1];
}

function priceBasedOnMileage(price, mileage) {
    //var estPrice = 0.9 * price - (mileage * 0.4); // 0.5 per km
    if( mileage > 5000)
        var estPrice = 0.9 * price - ((mileage-5000) * 0.5); // 0.5 per km
    else
        var estPrice = price - mileage / 5000 * 0.1 * price
    if(estPrice < 0)
        estPrice = 0;
    return estPrice;
}

function estimatedPrice(price, mileage) {
    ME_EST_PRICE = priceBasedOnMileage(price, mileage);
    $( "#estimatedValue" ).html(intToAmount(ME_EST_PRICE));
}

function get_policy() {
    $.get({
        url: MAIN_URL+"/api/v1/car-policy",
        data: {        },
        success: function( result ) {
            ME_PRICE = result.details.originalPrice;
            $( "#vehicle" ).html(result.car);
            $( "#model" ).html(result.details.model);
            $( "#model2" ).html(result.details.model);
            $( "#originalPrice" ).html(intToAmount(ME_PRICE));
            estimatedPrice(ME_PRICE, ME_MILEAGE);
            var imageNameJSON = imageFromX500Name(result.insurer);
            $( "#trustIssuer" ).html(imageNameJSON.O);
            $( "#trustissuer-logo" ).html("<img src=\""+imageNameJSON.logo+"\"/>");
            var nofDamages = result.accidentState == "NO" ? "0" : (
                result.accidentState == "ONE" ? "1" : "> 1");
            $( "#numberOfDamages" ).html(nofDamages);
            if (result.state == "FRAUD") {
                $( "#fraudImage" ).html("<img style=\"width:20px\" src=\"images/red.png\"/>");
            } else {
               $( "#fraudImage" ).html("<img style=\"width:20px\" src=\"images/green.png\"/>");
            }
            drawBasic();
        }
    }).fail(function(e) {
      $( "#errorMessage" ).html( "Oh, holy heaven: error reading data from trust store" );
    });
}
function get_vehicle() {
    $( "#car-policy-url" ).attr("href", MAIN_URL+"/api/v1/car-policy");
    $( "#car-policy-url2" ).attr("href", MAIN_URL+"/api/v1/car-policy");
    $( "#car-event-url" ).attr("href", MAIN_URL+"/api/v1/car-event");
    $( "#car-event-url2" ).attr("href", MAIN_URL+"/api/v1/car-event");

    $.get({
        url: MAIN_URL+"/api/v1/car-event",
        data: {        },
        success: function( result ) {
            //$( "#" ).html(result.);
            ME_CAR_EVENT = result;
            $( "#vehicleIdentNumber" ).html(result.vin);
            ME_MILEAGE = result.mileage;
            $( "#mileage" ).html(intFormat(ME_MILEAGE)+" km");
            $( "#mileage2" ).html(intFormat(ME_MILEAGE)+" km");
            $( "#addFraud" ).attr("value", ME_MILEAGE);
            $( "#addMileage" ).attr("value", ME_MILEAGE);

            estimatedPrice(ME_PRICE, ME_MILEAGE);
            $( "#operatingHours" ).html("-");
            if(result.accident)
                $( "#damage" ).html("Nein");
            else
                $( "#damage" ).html("Ja");
            get_policy();
        }
    }).fail(function(e) {
      $( "#errorMessage" ).html( "Oh, holy heaven: error reading data from trust store" );
    });

}

function imageFromX500Name(x500){
    var x500name = x500.split(",");
    var O=x500name[0].split("=")[1];
    var L=x500name[1].split("=")[1];
    var C=x500name[2].split("=")[1];
    var imageName = O.trim().replace(/[ ]/g, '_').replace(/[,\.]/g, '').toLowerCase();
    return { "O" : O, "L" : L, "C" : C,
        "logo" : "images/node_"+imageName+".jpeg",
        "background" : "images/node_background_"+imageName+".jpeg" };

}

function get_me() {
    $.get({
        url: MAIN_URL+"/api/v1/me",
        data: {        },
        success: function( result ) {
             var imageNameJSON = imageFromX500Name(result.me.x500Principal.name);
             $( "#party_me" ).html( imageNameJSON.O+", "+imageNameJSON.L+" ("+imageNameJSON.C+")" );
             $( "#image_me" ).html( "<img src=\""+imageNameJSON.logo+"\"/>" );
             $("body").css("background-image", "url("+imageNameJSON.background+")");
             setTimeout(drawBasic, 500);
        }
    }).fail(function(e) {
      $( "#errorMessage" ).html( "Oh, holy heaven: error reading data from trust store" );
    });
}



window.addEventListener('resize', function(event){
  // do stuff here
  console.log('resized');
  drawBasic();
});


// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart'], 'language': 'uk'});

// Set a callback to run when the Google Visualization API is loaded.


google.charts.setOnLoadCallback(drawBasic);


// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawBasic() {
    if (!google.visualization.arrayToDataTable || !google.visualization.LineChart) {
        setTimeout(drawBasic, 500);
        return;
    };
    if (mileage < 0) return;
    var mileage = ME_MILEAGE; //Testing
    var point = 'point { size: 10; shape-type: circle; fill-color: #a52714; }';

    var estPrice = ME_EST_PRICE;
    var maxMileage = mileage > 250000 ? mileage * 1.1 : 250000;

    // Create the data table.
    if(mileage <= 5000)
        var data = google.visualization.arrayToDataTable
                ([['X', 'Y', {'type': 'string', 'role': 'style'}],
                  [0, ME_PRICE, null],
                  [mileage, estPrice, point],
                  [5000, 0.9 * ME_PRICE, null],
                  [maxMileage,  priceBasedOnMileage(ME_PRICE, maxMileage), null]
            ]);
    else
        var data = google.visualization.arrayToDataTable
                ([['X', 'Y', {'type': 'string', 'role': 'style'}],
                  [0, ME_PRICE, null],
                  [5000, 0.9 * ME_PRICE, null],
                  [mileage, estPrice, point],
                  [maxMileage,  priceBasedOnMileage(ME_PRICE, maxMileage), null]
            ]);

    // Set chart options
    var options = {
        title: 'Simulation km / Verkaufspreis',
        legend: 'none',
        height: 350,
        pointSize: 1,
        dataOpacity: 1,
        hAxis: {
          ticks: [0, 50000, 100000, 150000, 200000, 250000],
          title: 'Kilometerstand'
        },
        vAxis: {
          minValue: 0,
          title: 'Fahrzeugwert'
        }
      };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}

function addMileage(tag, incMileage, accident = false) {
    animationOn();
    ME_CAR_EVENT.mileage += incMileage;
    ME_CAR_EVENT.timestamp = new Date().getSeconds();
    ME_CAR_EVENT.operatingHours += 1;
    ME_CAR_EVENT.accident = accident;
    $.ajax({
        url: MAIN_URL+"/api/v1/car-event",
        type: "POST",
        data: JSON.stringify(ME_CAR_EVENT),
        headers: {
            "Content-Type": "application/json"
        }
    }).done(function(result) {
        console.log("successful car-event sent")
    })
    .fail(function(e) {
      $( "#errorMessage" ).html( "error while writing mileage for you. "+e );
    });
}


function addFraud(tag, factor, decMileage = 0) {
    var newMileage = ME_MILEAGE * factor - decMileage;
    addMileage(tag, newMileage - ME_MILEAGE);
}

function setWebSocketConnected(connected, running) {
     if (connected && running) {
        $("#image-socket").html("<img id='image-socket-ball' width='20px' src='images/green.gif'>")
     } else if (connected) {
        $("#image-socket").html("<img id='image-socket-ball' width='20px' src='images/green.png'>")
     } else {
        $("#image-socket").html("<img id='image-socket-ball' width='20px' src='images/red.png'>")
     }
}

function mark_changed_off() {
    $(".mark-changed").removeClass("changed");
}

function mark_changed() {
    $(".mark-changed").addClass("changed");
    setTimeout(mark_changed_off, 1000);
}
function connectWebSocket() {
    var socket = new SockJS(MAIN_URL+'/gs-guide-websocket');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, function (frame) {
        setWebSocketConnected(true, false);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/vaultChanged/*', function (changes) {
            get_vehicle();
            mark_changed();
            animationOff();
        });
    });
}


function animationOff() {
    setWebSocketConnected(true, false);
}
function animationOn() {
    setWebSocketConnected(true, true);
}

function load_data() {
    connectWebSocket();
    get_me();
    get_vehicle();
}