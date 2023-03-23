import { Part } from './part.js';

export class Craft {
    constructor(json) {
        if(json.hasOwnProperty("AssemblyDefinition")) {
            this.craftName = json.AssemblyDefinition.assemblyName;
            this.description = json.AssemblyDefinition.description;
        } else if (json.hasOwnProperty("Metadata")) {
            this.craftName = json.Metadata.VehicleName;
            this.description = json.Metadata.Description;
        }
        if(json.AssemblyOABConfig) {
            if(json.AssemblyOABConfig.RootGuid.Guid != "00000000-0000-0000-0000-000000000000") {
                this.rootPartGuid = json.AssemblyOABConfig.RootGuid.Guid;
            } else {
                this.rootPartGuid = json.vesselState.CurrentControlOwnerPart.Guid;
            }
            this.rootPart;
            if(json.PartRelationshipData) {
                this.partRelationships = json.PartRelationshipData;
            }
        }
        this.Parts = [];
        this.loadPartsFromJson(json.parts);
        this.partCount = this.Parts.length;

        this.heirarchy = [];
        this.buildHeirarchy();
    }

    loadPartsFromJson = function (partsList) {
        for (let part of partsList) {
            let newPart = new Part(part);
            newPart.setParentCraft(this);
            this.Parts.push(newPart);
        }
    }

    getPartByGuid = function (guid) {
        return this.Parts.find( el => el.Guid == guid );
    }

    buildHeirarchy = function () {
        let partQueue = [...this.Parts];
        let rootPart = this.Parts.find( el => el.Guid == this.rootPartGuid );
        rootPart.isRoot = true;
        this.rootPart = rootPart;
        this.heirarchy.push(rootPart);
        // remove the root part:
        partQueue.shift();

        while( partQueue.length ) {
            let curPart = partQueue[0];
            for (let node of curPart.nodes) {
                if (node.AttachedPartGuid.Guid != "00000000-0000-0000-0000-000000000000") {
                    // Check if part is in heirarchy already:
                    let checkPart = this.heirarchy.find( el => el.Guid == node.AttachedPartGuid.Guid )
                    if( checkPart ) {
                        curPart.parent = checkPart;
                    } 
                }
            }
            this.heirarchy.push(curPart);
            partQueue.shift();
        }
    }
}