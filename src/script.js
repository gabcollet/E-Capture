const { ipcRenderer } = require("electron");
const remote = require('@electron/remote');
const { Menu } = remote;

window.addEventListener('DOMContentLoaded', () => {
    console.log('loaded');
    let sourceName = '';
    let image = null;
    let saveBtn = null;

    //Send event for the capture and create save button 
    document.getElementById('btn').addEventListener('click', () => {
        ipcRenderer.send('screenshot:capture', {sourceName});
         //Send event for Save
        if(!saveBtn){
            saveBtn = document.createElement("button");
            saveBtn.innerText = "Save";
            saveBtn.id = "saveBtn";
            document.getElementsByTagName("body")[0].appendChild(saveBtn);  
            document.getElementById('saveBtn').addEventListener('click', () => {
                ipcRenderer.send('imgSave', {image, sourceName});
            });
        }
    });

    //Send event for Select
    document.getElementById('screenSelectBtn').addEventListener('click', () => {
        ipcRenderer.send('imgSource', {});
    });

    //Show image on screen
    ipcRenderer.on('screenshot:captured', (e, imageData) => {
        document.getElementById("placeholder").src = imageData;
        image = imageData;
    });
    
    //Build the menu for the sources
    let srcOptionMenu;
    ipcRenderer.on('videoList', (e, sources) => {
        srcOptionMenu = Menu.buildFromTemplate(
            sources.map(source => {
                return {
                    label: source.name,
                    click: () => selectSource(source)
                };
            })
        );
        srcOptionMenu.popup();
    });
    
    function selectSource (source) {
        document.getElementById("txt").innerText = source.name;
        sourceName = source.name;
    }
});