export class Part {
    constructor (part) {
        this.Guid = part.PartGuid.Guid;
        this.name = part.partName;
        this.modules = part.PartModulesState
        this.state = part.partState;
        this.nodes = part.partState.attachNodeStates;
        this.isRoot = false;
        this.parent = null;

        let colorModule = this.modules.find(el => el.Name == "PartComponentModule_Color");
        this.base = new RGBAColor(colorModule.ModuleData[0].DataObject.Base.storedValue);
        this.accent = new RGBAColor(colorModule.ModuleData[0].DataObject.Accent.storedValue);
    }

    setParentCraft = function (craft) {
        this.craft = craft;
    }

    addPartToList = function () {
        this.domElement = document.createElement('li');
        this.domElement.classList.add('partListItem');
        this.domElement.setAttribute('guid', this.Guid);
        this.domElement.innerHTML = '<a href="#">' + this.name + '</a><span class="colorblocks"></span>';
        
        if(this.isRoot) {
            document.querySelector('#partListNav').appendChild(this.domElement);
            this.domElement.classList.add('selectedPart');
        } else {
            let ul = document.createElement('ul');
            ul.appendChild(this.domElement);
            this.parent.domElement.appendChild(ul);
        }
        this.setColorBlock(this.base.RGBAString(), 15);
        this.setColorBlock(this.accent.RGBAString(), 15);
    }

    setColorBlock = function (color, size) {
        let block = document.createElement('div');
        block.classList.add('colorblock', 'partlist-colorblock');
        block.style.width = size + 'px';
        block.style.height = size + 'px';
        block.style.backgroundImage = 'linear-gradient(0deg, rgba(' + color + '), rgba(' + color + ')), url("images/trans.png")';
        
        this.domElement.querySelector('.colorblocks').appendChild(block);
    }

    setBaseColor = function (color) {
        this.base = new RGBAColor( color );
    }

    setAccentColor = function (color) {
        this.accent = new RGBAColor( color );
    }

    updateColorBlocks = function () {
        this.domElement.querySelector('.colorblocks').innerHTML = "";
        this.setColorBlock(this.base.RGBAString(), 15);
        this.setColorBlock(this.accent.RGBAString(), 15);
    }


}

class RGBAColor {
    constructor ( rgba ) {
        this.r = rgba.r;
        this.b = rgba.b;
        this.g = rgba.g;
        this.a = rgba.a;

        this.fullValue = {
            'r' : convertToFullValue(this.r),
            'g' : convertToFullValue(this.g),
            'b' : convertToFullValue(this.b),
            'a' : this.a
        }
    }

    RGBAString = function () {
        let str = convertToFullValue(this.r) +  ',' + convertToFullValue(this.g) + ',' 
        + convertToFullValue(this.b) + ',' + this.a.toFixed(2);
        return str;
    }
}

function convertToFullValue (val) {
    return (val * 255).toFixed(2);
}

function normalizeColor (val) {
    return (val / 255);
}