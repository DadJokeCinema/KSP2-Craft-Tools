import { Craft } from './craft.js'

let craftFileInput = document.querySelector("#fileUpload");
let craftTextArea = document.querySelector('#json-text');

let craftDetailsDiv = document.querySelector('.craftDetails');
let partDetailsDiv = document.querySelector('.partDetails');
let colorEditorDiv = document.querySelector('.colorEditor');

let jsonFromFile;
let jsonLiveCopy;

let craft;
let selectedPart;

let colorList = [];
let selectedTab = "craft";

// Event Handlers
craftFileInput.addEventListener("change", 
    () => {
        // Craft File Import
        if(!craftFileInput.value.length) return;
        let reader = new FileReader();
        reader.onload = parseCraftFile;
        reader.readAsText(craftFileInput.files[0]);
        
        // Delete old craft
        craft = null;
    }, false);

craftTextArea.addEventListener("paste", 
    (e) => {
        // Verify and Parse TextArea JSON
        let pastedJSON = e.clipboardData.getData("text");
        parseCraftFile(pastedJSON);
    }, false);


document.querySelector('.craftTabSelector').addEventListener('click', displayCraftInfo);
document.querySelector('.partTabSelector').addEventListener('click', displayPartInfo);
document.querySelector('.colorEditorSelector').addEventListener('click', displayColorEditor);

document.querySelector('.setBaseButton').addEventListener('click', setBase);

// Alwan color picker 
const alwan = new Alwan('#colorpicker', {
    id: 'colpicker',
    theme: 'dark',
    toggle: false, 
    popover: false,
    position: 'bottom-start',
    target: '#pickerContainer'
});

function parseCraftFile (file) {
    if(craftFileInput.value.length) {
        document.querySelector('#json-text').value = file.target.result;
        jsonFromFile = JSON.parse(file.target.result);
        jsonLiveCopy = jsonFromFile;
    } else {
        jsonLiveCopy = JSON.parse(file);
    }
    
    craft = new Craft(jsonLiveCopy);
    // Craft name
    document.querySelector('#craftName').textContent = craft.craftName;
    for ( let part of craft.Parts ) {
        part.addPartToList();
        part.domElement.addEventListener('click', selectPart.bind(part));
    }
    selectedPart = craft.rootPart;
    displayCraftInfo(null);
}

function displayCraftInfo (e){
    if(e){
        e.preventDefault();
    }
    
    if(craft) {
        // Clear Craft Details
        while (craftDetailsDiv.firstChild) {
            craftDetailsDiv.removeChild(craftDetailsDiv.firstChild);
        }

        let topDetailsDiv = document.createElement('div');
        let craftDescriptionP = document.createElement('p');
        craftDescriptionP.innerHTML = "<strong>Description:</strong> " + craft.description;
        let craftPartCountP = document.createElement('p');
        craftPartCountP.innerHTML = "<strong>Part Count:</strong> " + craft.partCount;
        let craftRootPartP = document.createElement('p');
        let rootPart = craft.getPartByGuid(craft.rootPartGuid).name;
        craftRootPartP.innerHTML = "<strong>Root Part:</strong> " + rootPart;
        
        topDetailsDiv.appendChild(craftDescriptionP);
        topDetailsDiv.appendChild(craftPartCountP);
        topDetailsDiv.appendChild(craftRootPartP);
        craftDetailsDiv.appendChild(topDetailsDiv);

        craftDetailsDiv.style = "display:block;";
    }

    // make other tabs hidden and craft details visible
    partDetailsDiv.style = "display:none;";
    colorEditorDiv.style = "display:none;";

    document.querySelector('.partTabSelector').removeAttribute('aria-selected');
    document.querySelector('.colorEditorSelector').removeAttribute('aria-selected');
    document.querySelector('.craftTabSelector').setAttribute('aria-selected', "true");

    selectedTab = "craft";
}

function displayPartInfo (e, part){
    if(e){
        e.preventDefault();
    }
    if(craft) {
        // Clear Craft Details
        while (partDetailsDiv.firstChild) {
            partDetailsDiv.removeChild(partDetailsDiv.firstChild);
        }
        if(!part) {
            part = selectedPart;
        }
        // part info
        let topDetailsDiv = document.createElement('div');
        let partNamep = document.createElement('p');
        partNamep.innerHTML = "<strong>Part Name:</strong> " + part.name;
        let partGuidP = document.createElement('p');
        partGuidP.innerHTML = "<strong>GUID:</strong> " + part.Guid;
        let partRescDiv = document.createElement('div');
        partRescDiv.innerHTML = "<strong>Resources:</strong>";
        partRescDiv.classList.add("border", "p-2");
        for ( let resource in part.state.resources ) {
            let resourceP = document.createElement('p');
            resourceP.textContent = part.state.resources[resource].name + ': ' + part.state.resources[resource].storedUnits + '\\' + part.state.resources[resource].capacityUnits;
            partRescDiv.appendChild(resourceP);
        }
        let partNodesDiv = document.createElement('div');
        partNodesDiv.innerHTML = "<strong>Nodes:</strong>";
        partNodesDiv.classList.add("border", "p-2");
        for ( let node of part.nodes ) {
            let attachedPartName = "None";
            if ( node.AttachedPartGuid.Guid != "00000000-0000-0000-0000-000000000000" ) {
                let attachedPart = craft.Parts.find(el => el.Guid == node.AttachedPartGuid.Guid );
                attachedPartName = attachedPart.name;
            }
            let nodeP = document.createElement('p');
            
            nodeP.textContent = node.nodeId + ': ' + attachedPartName;
            partNodesDiv.appendChild(nodeP);
        }
        
        topDetailsDiv.appendChild(partNamep);
        topDetailsDiv.appendChild(partGuidP);
        topDetailsDiv.appendChild(partRescDiv);
        topDetailsDiv.appendChild(partNodesDiv);
        partDetailsDiv.appendChild(topDetailsDiv);

        partDetailsDiv.style = "display:block;";
    }
    // make other tabs hidden and craft details visible
    craftDetailsDiv.style = "display:none;";
    colorEditorDiv.style = "display:none;";
 
    document.querySelector('.craftTabSelector').removeAttribute('aria-selected');
    document.querySelector('.colorEditorSelector').removeAttribute('aria-selected');
    document.querySelector('.partTabSelector').setAttribute('aria-selected', "true");

    selectedTab = "part";
}

function makeColorToast (rgba, name) {
    let parent = document.querySelector('.partColorToasts');

    let h4 = document.createElement('div');
    h4.className = "f4";
    h4.innerHTML = "<p>" + name + " Color:</p>";
    let div = document.createElement('div');
    div.classList.add("Toast");
    let block = document.createElement('span');
    block.classList.add('colorblock', "Toast-icon");
    let rgbaString = rgba.RGBAString();
    block.style.backgroundImage = 'linear-gradient(0deg, rgba(' + rgbaString + '), rgba(' + rgbaString + ')), url("images/trans.png")';
    let desc = document.createElement('span');
    desc.classList.add('Toast-content');
    desc.textContent = "r: " + rgba.fullValue.r + " g: " + rgba.fullValue.b + " b: " + rgba.fullValue.g + " a: " + rgba.fullValue.a;

    parent.appendChild(h4);
    div.appendChild(block);
    div.appendChild(desc)
    parent.appendChild(div);

    block.onclick = function(e) {
        e.preventDefault();
        alwan.setColor(rgba.fullValue);
        document.querySelector('.alwan__slider--alpha').value = rgba.a;
        document.querySelector('.alwan__inputs > label:last-of-type > input').value = rgba.a;
    };
}

function displayColorEditor (e) {
    if ( craft ) {
        let parent = document.querySelector('.partColorToasts');
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }

        parent = document.querySelector('#shipColors');
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }

        // Build Color list 
        colorList = [];
        for ( let part of craft.Parts) {
            if(colorList.findIndex(el => el == part.base.RGBAString()) == -1) {
                colorList.push(part.base.RGBAString());
            }
            if(colorList.findIndex(el => el == part.accent.RGBAString()) == -1) {
                colorList.push(part.accent.RGBAString());
            }
        }

        // Get part colors
        makeColorToast(selectedPart.base, "Base");
        makeColorToast(selectedPart.accent, "Accent");

        for (let color of colorList) {
            let div = document.createElement('div');
            div.classList.add("Toast");
            let block = document.createElement('span');
            block.classList.add('colorblock', "Toast-icon");
            block.style.backgroundImage = 'linear-gradient(0deg, rgba(' + color + '), rgba(' + color + ')), url("images/trans.png")';
            let desc = document.createElement('span');
            desc.classList.add('Toast-content');
            let colvalues = color.split(',');
            desc.textContent = "r: " + colvalues[0] + " g: " + colvalues[1] + " b: " + colvalues[2] + " a: " + colvalues[3];

            div.appendChild(block);
            div.appendChild(desc)
            parent.appendChild(div);

            block.onclick = function(e) {
                e.preventDefault();
                alwan.setColor({'r' : colvalues[0], 'g' : colvalues[1], 'b' : colvalues[2], 'a' : colvalues[3]});
                document.querySelector('.alwan__slider--alpha').value = colvalues[3];
            document.querySelector('.alwan__inputs > label:last-of-type > input').value = colvalues[3];
            };
        }
    }


    // make other tabs hidden and craft details visible
    craftDetailsDiv.style = "display:none;";
    partDetailsDiv.style = "display:none;";
    colorEditorDiv.style = "display:block;";
    document.querySelector('.craftTabSelector').removeAttribute('aria-selected');
    document.querySelector('.partTabSelector').removeAttribute('aria-selected');
    document.querySelector('.colorEditorSelector').setAttribute('aria-selected', "true");

    selectedTab = "color";
}



function selectPart (e) {
    e.stopPropagation();
    e.preventDefault();
    for (var item of document.querySelectorAll('.selectedPart')) {
        item.classList.remove('selectedPart');
    }
    this.domElement.classList.add('selectedPart');
    selectedPart = this;

    if(selectedTab == "craft" || selectedTab == "part") {
        displayPartInfo(null, selectedPart);
    } else {
        displayColorEditor();
    }
    return false;
}

function setBase() {
    let color = alwan.getColor().rgb();
    let jsonPart = jsonLiveCopy.parts.find(el => el.PartGuid.Guid == selectedPart.Guid);
    let colorModule = jsonPart.PartModulesState.find(el => el.Name == "PartComponentModule_Color");
    color.r = color.r / 255;
    color.b = color.b / 255;
    color.g = color.g / 255;
    colorModule.ModuleData[0].DataObject.Base.storedValue = color;
    selectedPart.setBaseColor(color);
    selectedPart.updateColorBlocks();
    displayColorEditor();
    craftTextArea.value =  JSON.stringify(jsonLiveCopy);
}