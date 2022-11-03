const { ipcRenderer } = require("electron");
const remote = require('@electron/remote');
const { Menu } = remote;

window.addEventListener('DOMContentLoaded', () => {
    console.log('loaded');
    let sourceName = '';
    // let image = null;

    //Send event for the capture and create save button 
    document.getElementById('btn').addEventListener('click', () => {
        ipcRenderer.send('screenshot:capture', {sourceName});
        const button = document.createElement("button");
        // button.innerText = "Save";
        // button.id = "saveBtn";
        // document.getElementsByTagName("body")[0].appendChild(button);  
    });

    //Send event for Select
    document.getElementById('screenSelectBtn').addEventListener('click', () => {
        ipcRenderer.send('imgSource', {});
    });
    
    //Send event for Save
    // document.getElementById('saveBtn').addEventListener('click', () => {
    //     ipcRenderer.send('imgSource', {});
    // });

    ipcRenderer.on('screenshot:captured', (e, imageData) => {
        document.getElementById("placeholder").src = imageData;
        // image = imageData;
    });
    
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
        console.log(source.name);
        document.getElementById("txt").innerText = source.name;
        sourceName = source.name;
    }
});