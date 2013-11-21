
var tourTemplate = "\
 <div class='popover tour'>\
    <div class='arrow'></div>\
    <h3 class='popover-title'></h3>\
    <div class='popover-content'></div>\
    <div class='popover-navigation'>\
        <button class='btn btn-small' data-role='prev'>« Prev</button>\
        <button class='btn btn-small' data-role='next'>Next »</button>\
        <button class='btn btn-small' data-role='end'>End</button>\
    </div>\
 </div>";

var tourMain = new Tour({
    template: tourTemplate,
    onStart: function(){
        console.log("start")
        $("body").append("<div id='anchorTour' style='position:absolute;top:50%;left:5%;width:10px;height:10px;'></div>");
    },
    storage: false,    
 });

tourMain.addSteps([
    // {
    //     title: "Здесь будет диалог выбора языка", 
    //     orphan: true,        
    // },
    {
        title: "Привет.<br>Сейчас немного разберемся что здесь к чему.<br>Жми либо кнопку Next либо на клавиатеру стрелку вправо.", 
        orphan: true,        
    },
    {
        title: "Поработаем с картой",
        orphan: true,        
    },    
    {
        element: "#map0",
        title: "Передвижение карты",
        content: "Любую карту можно двигать, захватив левой кнопкой мыши, либо одиночным касанием, если имеется сенсорный экран. После перемещения все остальные активные карты перемещаются в тоже самое место.",
        backdrop: true,
    },
    {
        title: "Вот, теперь можно подвигать карты",
        orphan: true, 
    },
    {
        element: "#map0 .leaflet-control-zoom",
        backdrop: true,
        content: "Видите вот эти штуки?",
    },
    {
        title: "Изменение масштаба",
        orphan: true, 
        content: "Это контрол изменения масштаба карты, плюс - приближение, минус - удаление. Также это можно делать колесиком мыши, либо на тачскрине двумя пальца делая т.н. щипок.",
    },    
    {
        element: "#map0 .leaflet-control-scale-line",
        content: "Эта полоска показывает масштаб в киллометрах",
    },
    {
        element: "#map0 .leaflet-bottom.leaflet-right",
        placement: "left",
        content: "А эти полоски: уровень увеличения, название карты, ну и еще какая-то хрень",
    },
    {
        title: "Попробуйте поменять масштаб и увидите изменения.",
        orphan: true, 
    },    
    {
        title: "А теперь добавим карт.",
        orphan: true, 
    },  
    {
        element: "#anchorTour",
        title: "Кликните правой кнопкой мыши на любой карте, появится меню.",
    },
    {
        element: "#anchorTour",
        title: "Теперь выбирайте",
        content: "- MAP<br>- Get External Maps",
    },    
    {
        element: "#anchorTour",
        content: "Кликайте на заголовок меню и выбирайте какую карту нужно",
    },    
    {
        element: "#anchorTour",
        title: "Карта появилась? Отлично если так.",
        content: "Карта появилавь в том окошке на который пришелся клик мыши когда вы открывали меню, если щелкнуть по другому окну и выполнить те же действия, то карта появится в нем. По сути все действия которые вы совершаете через меню отражаются именно на активной карте.",
    },
    {
        element: "#anchorTour",
        title: "Но вот беда!",
        content: "Если сейчас перезагрузить страницу мы снова вернемся к этим скучным и унылым стандартным картам.",
    }, 
    {
        element: "#anchorTour",
        title: "Нужно сохранить загруженную карту.",
    },    
    {
        element: "#anchorTour",
        title: "В меню выбирайте",
        content: "- MAP<br>- Add Selected Map To Storage<br>Щелкать нужно естественно на той карте которую надо сохранить.",
    },         
    {
        element: "#anchorTour",
        title: "Открылась целая простыня",
        content: "Это настройки карты, не стоит сразу сильно в них вникать, главное найдите кнопку 'Add Map' и нажмите на нее.",
    },   
    {
        element: "#anchorTour",
        title: "Отлично",
        content: "Теперь в любой момент эту карту можно установить на любую панель из меню MAP/Set Map",
    },   
    {
        element: "#anchorTour",
        title: "А если карт хочется много?",
        content: "Есть возможность добавить их всем скопом MAP/Get All Maps From JSON",
    },
    {
        element: "#anchorTour",
        content: "А так же в любой момент изменить любые параметры любой карты MAP/Edit Map",
    },    
 ]);
