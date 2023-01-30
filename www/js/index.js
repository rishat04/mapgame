var app = {
    myMap: null,
    options: {timeout:1000},
    coords_to_draw: [],
    center: [],
        : [],
    running: false,
    color: null,
    data: [],
    email: "",
    leaders: [],
    // Application Constructor
    initialize: function() {


        ymaps.ready(this.initYandexApi);


        //navigator.geolocation.getCurrentPosition(app.onSuccess, app.onError);

        var watchID = navigator.geolocation.watchPosition(app.onSuccess, app.onError, this.options);


    },

    initYandexApi: function() {

         // Создание карты.
       this.myMap = new ymaps.Map("map", {
            // Координаты центра карты.
            // Порядок по умолчанию: «широта, долгота».
            // Чтобы не определять координаты центра карты вручную
            // воспользуйтесь инструментом Определение координат.
            center: [55.7305685, 52.3892884],
             // Уровень масштабирования. Допустимые значения:
            // от 0 (весь мир) до 19.
            zoom: 16    
        });   

       (function update() {
        setTimeout(update, 1000);

        myMap.geoObjects.removeAll();
        
        var polygons = [];
        if(app.data) {
            for (var i = 0; i < app.data.length; i++) {
                polygons.push([app.data[i].color, app.data[i].polygon]);
            }
            //console.log(polygons[0][1]);
        }

        if(polygons)
            for (var i = 0; i < polygons.length; i++) {
                var polygon = new ymaps.Polygon([
                      // Координаты внешнего контура.
                     // Координаты внутреннего контура.
                    polygons[i][1][0]
                ], {
                }, {
                    fillColor: polygons[i][0], //#6699ff
                    // Делаем полигон прозрачным для событий карты.
                    interactivityModel: 'default#transparent',
                    strokeWidth: 8,
                    opacity: 0.5
                });

                myMap.geoObjects.add(polygon);
            }

        if(app.running) {         
            var polyline = new ymaps.Polyline(
                app.coords_to_draw,
                {},
                {ballonCloseButton: false,
                 strokeColor: "#ff0000", //#6699ff
                 strokeWidth: 10,
                 strokeOpacity: 0.5
                });

            myMap.geoObjects.add(polyline); 

            //navigator.geolocation.getCurrentPosition(app.onSuccess, app.onError);
        }
       })();

        
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {   
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
    },

    onSuccess: function(position) {
        if (app.running) {
            if (app.coords_to_draw.length == 0)    
                app.coords_to_draw.push([position.coords.latitude, position.coords.longitude]);
            else {
                var a = app.coords_to_draw[app.coords_to_draw.length-1];
                var b = [position.coords.latitude, position.coords.longitude];
                if(ymaps.coordSystem.geo.getDistance(a, b) >= 3) //from 3 meters
                    app.coords_to_draw.push([position.coords.latitude, position.coords.longitude]);


                if (ymaps.coordSystem.geo.getDistance(app.coords_to_draw[0], b) <= 10 && app.coords_to_draw.length > 5) {
                    app.coords_to_polygon.push(app.coords_to_draw.slice());
                    writePolygon(app.coords_to_polygon, app.email, app.color);
                    app.data = [];
                    app.coords_to_draw = [];
                    app.data = readdata();   
                }
            }
        }
    },

    onError: function(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    },

    calculateArea: function() {
        app.data = [];
        app.data = readdata();
        ymaps.ready(['util.calculateArea']).then(function () {
            app.leaders = [];
            for(var i = 0; i < app.data.length; i++) {
                var polygon = new ymaps.Polygon([
                        app.data[i].polygon[0],
                        []
                    ])
                var area = ymaps.util.calculateArea(polygon);
                if (app.leaders[app.data[i].email])
                    app.leaders[app.data[i].email] += area;
                else
                    app.leaders[app.data[i].email] = area;
            }
        });
    }
};

function grab() {
    var text = document.getElementById("grabbtn").innerHTML;
    if(text == "Захватить") {
        app.running = true;
        document.getElementById("grabbtn").innerHTML = "Отхватить";
    }
    else{
        app.running = false;
        app.coords_to_draw = [];
        app.coords_to_polygon = [];
        document.getElementById("grabbtn").innerHTML = "Захватить";
    }
}

function sort(arr) {
    var sortable = [];
    for(var email in arr)
        sortable.push([email, arr[email]]);
    sortable.sort(function(a, b) {
        return a[1] - b[1];
    });
    return sortable.reverse();
}

function showLeaders() {
    var leadbtn = document.getElementById("leaderboard");
    if (leadbtn.style.display == "block")
        leadbtn.style.display = "none";
    else {
        leadbtn.style.display = "block";
        app.calculateArea();
        var area = sort(app.leaders);

        var ul = document.getElementById("result");
        ul.innerHTML = '';
        for (var i = 0; i < area.length; i++) {
            var li = document.createElement("li");
            var email = document.createTextNode(area[i][0]);
            var ap = document.createTextNode(Math.ceil(area[i][1]*100)/100 + " m2"); //area of polygon
            var br = document.createElement("br");
            var span = document.createElement("span");
            span.appendChild(ap);
            li.appendChild(email);
            li.appendChild(br);
            li.appendChild(span);
            ul.appendChild(li);
        }
    }
}
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAOPJ9JG59WrRypObqYmOlLt0_OmcdLEE4",
    authDomain: "mapgame-ab4ae.firebaseapp.com",
    databaseURL: "https://mapgame-ab4ae.firebaseio.com",
    projectId: "mapgame-ab4ae",
    storageBucket: "mapgame-ab4ae.appspot.com",
    messagingSenderId: "909003929597",
    appId: "1:909003929597:web:358c9d0c0629b829b44b94",
    measurementId: "G-QF5MM4HR54"
};
          // Initialize Firebase
firebase.initializeApp(firebaseConfig);
          //firebase.analytics();   
  

var database = firebase.database();
const auth = firebase.auth();



function signUp(){
    
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    
    const promise = auth.createUserWithEmailAndPassword(email.value, password.value);
    promise.catch(e => alert(e.message));
    
    alert("Signed Up");
}



function signIn(){
    
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    
    const promise = auth.signInWithEmailAndPassword(email.value, password.value);
    promise.catch(e => alert(e.message));    
    
}

function readdata() {
    var data = [];
    firebase.database().ref("/polygons/").on("value", function(polygons) {
        polygons.forEach(function(p) {
            data.push(p.val());
        });
    });
    return data;
}

function signOut(){
    
    auth.signOut();
    alert("Signed Out");
    
}

function writePolygon(polygon, email, color) {
    var data = {
        email: email,
        polygon: polygon,
        color: color
    };

    var firebaseRef = firebase.database().ref();

    firebaseRef.child("polygons").push(data);

    //firebaseRef.child("polygons").set(data);

}

auth.onAuthStateChanged(function(user){
    
    if(user){
        
        var email = user.email;
        alert("Active User " + email);


        document.getElementById("formcontainer").style.display = "none";
        document.getElementsByClassName("button")[0].style.display = "block";
        document.getElementsByClassName("button")[1].style.display = "block";
        document.getElementsByClassName("button")[2].style.display = "block";
        document.getElementById("grabbtn").innerHTML = "Захватить";
        document.getElementById("map").style.display = "block";


        app.initialize();

        app.data = readdata();
        //console.log(app.data);
        app.email = email;

        //app.running = true;
        app.color = document.getElementById("color").value;
        if (!app.color)
            app.color = "#6699ff"
        //Take user to a different or home 
        //is signed in
        
    }else{

        document.getElementById("formcontainer").style.display = "block";
        document.getElementsByClassName("button")[0].style.display = "none";
        document.getElementsByClassName("button")[1].style.display = "none";
        document.getElementsByClassName("button")[2].style.display = "none";
        document.getElementById("leaderboard").style.display = "none";
        document.getElementById("map").style.display = "none";
        app.running = false;
        app.coords_to_draw = [];
        app.coords_to_polygon = [];
        alert("No Active User");
        //no user is signed in
    }
});